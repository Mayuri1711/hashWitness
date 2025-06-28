# HashWitness

**Tagline:** "Every change witnessed, every day sealed on the blockchain."

HashWitness is a serverless audit pipeline built on AWS that allows you to **cryptographically prove that your files existed at a specific point in time** — without relying on any central authority.

It uses AWS Lambda, DynamoDB, OpenTimestamps, Merkle Trees, and Amazon S3 to ensure file integrity, tamper-proof logging, and verifiable timestamping.

---

## Use Case

Organizations often need to prove the **existence and integrity of files** (e.g., legal documents, logs, images) for compliance, audit trails, or legal evidence.

**HashWitness creates cryptographic timestamp proofs** and publishes them using decentralized systems (OpenTimestamps + Bitcoin network) — making the integrity independently verifiable even years later.

---

## Requirements

- AWS account with S3, Lambda, and DynamoDB access
- Node.js v18 or higher (for Lambda)
- IAM Roles with required permissions (see below)
- One S3 bucket (e.g., `hash-audit-bucket`)
- One DynamoDB table (e.g., `S3ObjectHashes`)
- [OpenTimestamps](https://opentimestamps.org/) for decentralized timestamping

---

## How It Works

1. Upload a file to S3 - manually or via application
2. AWS Lambda function (`HashAndLogS3Object`) will detect file change in S3 automatically, hashes it (SHA256) and logs the info to DynamoDB
3. Periodically (Every 24 hours), another Lambda (`BuildMerkleTree`) builds a Merkle Tree of the hashes
4. Merkle Root is submitted to OpenTimestamps
5. The .ots proof file is saved to S3
6. After 24 hours, the proof is verified and confirmed anchored to Bitcoin

---

## Automation

- For full automation, use **AWS Step Functions** to orchestrate:

  - After `BuildMerkleTree`, run `SubmitToOTS`
  - After 24 hours, run `VerifyOTS`

You can also use **EventBridge rules** for scheduling and sequencing.

---

## Roadmap

- Add API Gateway for on-demand proof search, at File level
- UI dashboard for file status and audit trail
- SNS alerts on tampering
- Save `.ots` backups to Arweave/IPFS

---

## References

- [OpenTimestamps](https://opentimestamps.org/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Merkle Tree - Wikipedia](https://en.wikipedia.org/wiki/Merkle_tree)

---

## Why This Matters

HashWitness helps ensure **data integrity**, **proof of existence**, and **verifiability** without trusting a central party.
It anchors file evidence to **Bitcoin** via OpenTimestamps, making it decentralized and tamper-evident.
