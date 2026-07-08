import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`ALTER TABLE "Resume" ADD COLUMN IF NOT EXISTS raw_ai_text TEXT`;
await sql`ALTER TABLE "Resume" ADD COLUMN IF NOT EXISTS raw_ai_response JSONB`;

console.log("✅ raw_ai_text and raw_ai_response columns added to Resume table");
