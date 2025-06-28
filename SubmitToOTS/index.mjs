import opentimestamps from "opentimestamps";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client();
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export const handler = async (event) => {
  try {
    // 1. Create hash from file/data
    const BUCKET = process.env.OTS_BUCKET;
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];
    const KEY = `${isoDate}/root-${isoDate}.txt`;
    const s3Object = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: KEY })
    );
    const rootFileBuffer = await streamToBuffer(s3Object.Body);
    const hashBuffer = crypto
      .createHash("sha256")
      .update(rootFileBuffer)
      .digest();
    // 2. Create OTS detached file
    const { DetachedTimestampFile, Ops } = opentimestamps;
    const detached = DetachedTimestampFile.fromHash(
      new Ops.OpSHA256(),
      hashBuffer
    );
    // const Calendar = opentimestamps.Calendar;
    // 3. Stamp using calendar server
    // const calendar = new Calendar("https://calendar.opentimestamps.org");
    await opentimestamps.stamp(detached);

    // 4. Serialize .ots
    const otsBuffer = detached.serializeToBytes();

    const otsKey = `${isoDate}/ots-proof-${isoDate}.ots`;

    // 5. Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.OTS_BUCKET,
        Key: otsKey,
        Body: otsBuffer,
        ContentType: "application/octet-stream",
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "OTS proof created and uploaded",
        key: otsKey,
      }),
    };
  } catch (err) {
    console.error("OTS process failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" }),
    };
  }
};
