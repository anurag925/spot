import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY } from "./env";

export const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

export async function uploadToS3(key: string, body: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export function generateS3Key(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = filename.includes(".") ? filename.split(".").pop() : "";
  return `spots/${timestamp}-${random}${ext ? `.${ext}` : ""}`;
}