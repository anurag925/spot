import { config } from "dotenv";

config(); // Load .env into process.env

export const DATABASE_URL = process.env.DATABASE_URL;
export const S3_BUCKET = process.env.S3_BUCKET ?? "";
export const S3_REGION = process.env.S3_REGION ?? "us-east-1";
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY ?? "";
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY ?? "";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
