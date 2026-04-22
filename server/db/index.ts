import postgres from "postgres";
import { DATABASE_URL } from "../env";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const sql = postgres(DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Run schema init on startup with error handling for idempotent operations
const initSQL = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "init.sql"), "utf-8");
for (const statement of initSQL.split(";").filter((s) => s.trim())) {
  try {
    await sql.unsafe(statement.trim());
  } catch (err: any) {
    // Ignore "already exists" errors for extensions and tables
    if (!err?.message?.includes("already exists") && !err?.message?.includes("duplicate")) {
      console.error("Init SQL error:", err.message);
    }
  }
}

export { sql };
