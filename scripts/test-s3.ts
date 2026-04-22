#!/usr/bin/env bun

/**
 * S3 Upload Test Script
 *
 * Tests if S3 upload is working by uploading a small test file.
 *
 * Usage:
 *   bun scripts/test-s3.ts
 *
 * Environment variables (from .env):
 *   S3_URL              - S3 base URL (e.g., https://idr01.zata.ai)
 *   S3_BUCKET           - S3 bucket name
 *   S3_REGION           - AWS region (e.g., idr01)
 *   AWS_ACCESS_KEY_ID   - AWS access key
 *   AWS_SECRET_ACCESS_KEY - AWS secret key
 */

import "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration
const S3_URL = process.env.S3_URL;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || "us-east-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Test file content
const TEST_CONTENT = `S3 Upload Test - ${new Date().toISOString()}`;
const TEST_FILENAME = `test-upload-${Date.now()}.txt`;

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
}

async function testS3Upload(): Promise<TestResult> {
  console.log("Testing S3 Upload...\n");

  // Check if credentials are provided
  if (!S3_URL || !S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    return {
      success: false,
      message: "Missing configuration",
      details: "Please set S3_URL, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY environment variables"
    };
  }

  return await testWithCredentials();
}

async function testWithCredentials(): Promise<TestResult> {
  console.log("Testing with AWS SDK...\n");

  try {
    const endpoint = S3_URL!.replace(/^https?:\/\//, "");

    console.log(`Endpoint: ${S3_URL}`);
    console.log(`Bucket: ${S3_BUCKET}`);
    console.log(`Region: ${S3_REGION}`);
    console.log(`File: ${TEST_FILENAME}\n`);

    // Create S3 client with custom endpoint
    const client = new S3Client({
      endpoint: S3_URL,
      region: S3_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
      },
      // Force path-style addressing for compatible providers
      forcePathStyle: true,
    });

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: TEST_FILENAME,
      Body: TEST_CONTENT,
      ContentType: "text/plain",
    });

    // Generate presigned URL
    console.log("Generating presigned URL...");
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    console.log(`Presigned URL: ${signedUrl}`);

    // Upload using fetch
    const encoder = new TextEncoder();
    const data = encoder.encode(TEST_CONTENT);

    const response = await fetch(signedUrl, {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": data.byteLength.toString(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Upload failed with status ${response.status}`,
        details: errorText
      };
    }

    return {
      success: true,
      message: "Upload successful!",
      details: `File uploaded to: ${S3_URL}/${TEST_FILENAME}`
    };

  } catch (error) {
    return {
      success: false,
      message: "Upload failed",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Run test
const result = await testS3Upload();

console.log("\n" + "=".repeat(50));
if (result.success) {
  console.log("SUCCESS:", result.message);
  if (result.details) console.log("   ", result.details);
} else {
  console.log("FAILED:", result.message);
  if (result.details) console.log("   Details:", result.details);
}

// Exit with appropriate code
process.exit(result.success ? 0 : 1);