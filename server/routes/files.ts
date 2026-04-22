import { sql } from "../db";
import { uploadToS3, generateS3Key } from "../s3";

/**
 * @openapi
 * /api/files:
 *   post:
 *     summary: Upload files to S3
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               spotId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Uploaded files metadata
 *       400:
 *         description: No files provided
 *   get:
 *     summary: Get uploaded files
 *     parameters:
 *       - in: query
 *         name: spotId
 *         schema: { type: integer }
 *         description: Filter files by spot ID
 *     responses:
 *       200:
 *         description: List of files
 */

export const filesRoutes = {
  async POST(req: Request) {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return Response.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files");
    const spotId = formData.get("spotId");

    if (files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const s3Key = generateS3Key(file.name);

      await uploadToS3(s3Key, buffer, file.type);

      const [row] = await sql`
        INSERT INTO files (original_name, s3_key, mime_type, size, spot_id)
        VALUES (
          ${file.name},
          ${s3Key},
          ${file.type},
          ${buffer.length},
          ${spotId ? parseInt(spotId as string, 10) : null}
        )
        RETURNING id, original_name, s3_key, mime_type, size, spot_id, created_at
      `;

      uploadedFiles.push(row);
    }

    return Response.json({ files: uploadedFiles }, { status: 201 });
  },

  async GET(req: Request) {
    const url = new URL(req.url);
    const spotId = url.searchParams.get("spotId");

    let rows;
    if (spotId) {
      rows = await sql`
        SELECT id, original_name, s3_key, mime_type, size, spot_id, created_at
        FROM files
        WHERE spot_id = ${parseInt(spotId, 10)}
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT id, original_name, s3_key, mime_type, size, spot_id, created_at
        FROM files
        ORDER BY created_at DESC
      `;
    }

    return Response.json({ files: rows });
  },
};