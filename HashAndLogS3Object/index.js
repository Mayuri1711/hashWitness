const AWS = require("aws-sdk");
const crypto = require("crypto");

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DDB_TABLE = process.env.DDB_TABLE;

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const versionId = record.s3.object.versionId || "null";

    try {
      const params = {
        Bucket: bucket,
        Key: key,
      };

      if (record.s3.object.versionId) {
        params.VersionId = record.s3.object.versionId;
      }

      const objectData = await s3.getObject(params).promise();

      const hash = crypto
        .createHash("sha256")
        .update(objectData.Body)
        .digest("hex");

      await dynamodb
        .put({
          TableName: DDB_TABLE,
          Item: {
            objectKey: key,
            versionId: versionId,
            hash: hash,
            timestamp: new Date().toISOString(),
          },
        })
        .promise();

      console.log(`Logged ${key} with hash ${hash}`);
    } catch (err) {
      console.error(`Error processing ${key}:`, err);
    }
  }

  return { statusCode: 200 };
};
