import opentimestamps from "opentimestamps";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import https from "https";

const s3 = new S3Client();
const { DetachedTimestampFile } = opentimestamps;

// Converts S3 stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export const handler = async (event) => {
  const BUCKET = process.env.OTS_BUCKET;
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const isoDate = yesterday.toISOString().split("T")[0];
  const KEY = `${isoDate}/ots-proof-${isoDate}.ots`;
  try {
    const s3Object = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: KEY })
    );
    const fileBuffer = await streamToBuffer(s3Object.Body);

    const detached = DetachedTimestampFile.deserialize(fileBuffer);

    console.log("Verifying timestamp via calendars...");
    await verifyAndUpgrade(detached);
    const upgradedOts = detached.serializeToBytes();
    console.log("Timestamp verified/upgraded");

    // Save upgraded file back
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: KEY, // overwrite or version depending on S3 settings
        Body: upgradedOts,
        ContentType: "application/octet-stream",
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Timestamp verified/upgraded",
        key: KEY,
      }),
    };
  } catch (err) {
    console.error("Upgrade failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Similar to opentimestamps.stamp() but manual
async function verifyAndUpgrade(detached) {
  const calendars = [
    "https://calendar.opentimestamps.org",
    "https://a.pool.opentimestamps.org",
    "https://b.pool.opentimestamps.org",
  ];

  const promises = calendars.map((url) =>
    postToCalendar(url, detached.serializeToBytes())
  );
  const results = await Promise.allSettled(promises);

  // Merge returned data if available
  for (const result of results) {
    if (result.status === "fulfilled") {
      try {
        const upgraded = DetachedTimestampFile.deserialize(result.value);
        detached.merge(upgraded);
      } catch (e) {
        console.warn("Merge failed:", e.message);
      }
    }
  }
}

// Manual POST to calendar server
function postToCalendar(url, bodyBuffer) {
  return new Promise((resolve, reject) => {
    const { hostname, pathname } = new URL(url + "/stamp");
    const req = https.request(
      {
        hostname,
        path: pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": bodyBuffer.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(Buffer.concat(chunks));
          } else {
            reject(new Error(`Calendar error ${res.statusCode}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(bodyBuffer);
    req.end();
  });
}
