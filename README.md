
<<<<<<< HEAD
HashWitness

Tagline: "Every change witnessed, every day sealed on the blockchain."

HashWitness is a serverless audit pipeline built on AWS that allows you to cryptographically prove that your files existed at a specific point in time — without relying on any central authority.
=======
# HashWitness

**Tagline:** "Every change witnessed, every day sealed on the blockchain."

HashWitness is a serverless audit pipeline built on AWS that allows you to **cryptographically prove that your files existed at a specific point in time** — without relying on any central authority.
>>>>>>> 6a2936606f7f1d5b8f917e559b89a71039e11e2a

It uses AWS Lambda, DynamoDB, OpenTimestamps, Merkle Trees, and Amazon S3 to ensure file integrity, tamper-proof logging, and verifiable timestamping.

---

<<<<<<< HEAD
Use Case

Organizations often need to prove the existence and integrity of files (e.g., legal documents, logs, images) for compliance, audit trails, or legal evidence.

HashWitness creates cryptographic timestamp proofs and publishes them using decentralized systems (OpenTimestamps + Bitcoin network) — making the integrity independently verifiable even years later.

---

Requirements
=======
## Use Case

Organizations often need to prove the **existence and integrity of files** (e.g., legal documents, logs, images) for compliance, audit trails, or legal evidence.

**HashWitness creates cryptographic timestamp proofs** and publishes them using decentralized systems (OpenTimestamps + Bitcoin network) — making the integrity independently verifiable even years later.

---

## Requirements
>>>>>>> 6a2936606f7f1d5b8f917e559b89a71039e11e2a

- AWS account with S3, Lambda, and DynamoDB access
- Node.js v18 or higher (for Lambda)
- IAM Roles with required permissions (see below)
- One S3 bucket (e.g., `hash-audit-bucket`)
- One DynamoDB table (e.g., `S3ObjectHashes`)
- [OpenTimestamps](https://opentimestamps.org/) for decentralized timestamping

---

<<<<<<< HEAD
How It Works
=======
## How It Works
>>>>>>> 6a2936606f7f1d5b8f917e559b89a71039e11e2a

1. Upload a file to S3
2. A Lambda hashes it and logs the info to DynamoDB
3. Every 24 hours, another Lambda builds a Merkle Tree of the hashes
4. Merkle Root is submitted to OpenTimestamps
5. The `.ots` proof file is saved to S3
6. After 24 hours, the proof is verified and confirmed anchored to Bitcoin

---

<<<<<<< HEAD
Automation

 For full automation, use AWS Step Functions to orchestrate:

   After `BuildMerkleTree`, run `SubmitToOTS`
   After 24 hours, run `VerifyOTS`

You can also use EventBridge rules for scheduling and sequencing.

---

Roadmap

 Add API Gateway for on-demand proof search
 UI dashboard for file status and audit trail
 SNS alerts on tampering
 Save `.ots` backups to Arweave/IPFS

---

References

 [OpenTimestamps](https://opentimestamps.org/)
 [AWS Lambda](https://aws.amazon.com/lambda/)
 [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
 [Amazon S3](https://aws.amazon.com/s3/)
 [Merkle Tree - Wikipedia](https://en.wikipedia.org/wiki/Merkle_tree)

---

Why This Matters

HashWitness helps ensure data integrity, proof of existence, and verifiability without trusting a central party.
It anchors file evidence to Bitcoin via OpenTimestamps, making it decentralized and tamper-evident.
=======
## Automation

* For full automation, use **AWS Step Functions** to orchestrate:

  * After `BuildMerkleTree`, run `SubmitToOTS`
  * After 24 hours, run `VerifyOTS`

You can also use **EventBridge rules** for scheduling and sequencing.

---

## Roadmap

* Add API Gateway for on-demand proof search
* UI dashboard for file status and audit trail
* SNS alerts on tampering
* Save `.ots` backups to Arweave/IPFS

---

## References

* [OpenTimestamps](https://opentimestamps.org/)
* [AWS Lambda](https://aws.amazon.com/lambda/)
* [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
* [Amazon S3](https://aws.amazon.com/s3/)
* [Merkle Tree - Wikipedia](https://en.wikipedia.org/wiki/Merkle_tree)

---

## Why This Matters

HashWitness helps ensure **data integrity**, **proof of existence**, and **verifiability** without trusting a central party.
It anchors file evidence to **Bitcoin** via OpenTimestamps, making it decentralized and tamper-evident.
>>>>>>> 6a2936606f7f1d5b8f917e559b89a71039e11e2a
