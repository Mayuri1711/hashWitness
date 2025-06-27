// index.mjs

import opentimestamps from "opentimestamps";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client();

export const handler = async (event) => {
  try {
    // 1. Create hash from file/data
    const fileData = Buffer.from("Sample data to hash");
    const hashBuffer = crypto.createHash("sha256").update(fileData).digest();

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
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];
    const otsKey = `ots-proof-${isoDate}.ots`;

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
