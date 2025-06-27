import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const ddb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

const DDB_TABLE = process.env.DDB_TABLE;
const ROOT_BUCKET = process.env.ROOT_BUCKET;

export const handler = async () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);

  // Step 1: Get hashes from last 24 hours
  const scanCmd = new ScanCommand({ TableName: DDB_TABLE });
  const result = await ddb.send(scanCmd);

  const hashes = result.Items.filter(
    (item) => new Date(item.timestamp.S) >= yesterday
  ).map((item) => item.hash.S);

  if (hashes.length === 0) {
    throw new Error("No hashes found in last 24 hours");
  }

  // Step 2: Build Merkle tree
  const buildMerkleTree = (leaves) => {
    if (leaves.length === 1) return leaves[0];

    const nextLevel = [];
    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = i + 1 < leaves.length ? leaves[i + 1] : left; // duplicate if odd
      const combined = left + right;
      const hash = crypto.createHash("sha256").update(combined).digest("hex");
      nextLevel.push(hash);
    }
    return buildMerkleTree(nextLevel);
  };

  const merkleRoot = buildMerkleTree(hashes);

  // Step 3: Upload to S3
  const date = now.toISOString().split("T")[0];
  const s3Key = `daily/root-${date}.txt`;

  const putCmd = new PutObjectCommand({
    Bucket: ROOT_BUCKET,
    Key: s3Key,
    Body: merkleRoot,
    ContentType: "text/plain",
  });

  await s3.send(putCmd);

  console.log(`Merkle Root uploaded to ${s3Key}:`, merkleRoot);

  return {
    statusCode: 200,
    merkleRoot,
    s3Key,
    leafCount: hashes.length,
  };
};
