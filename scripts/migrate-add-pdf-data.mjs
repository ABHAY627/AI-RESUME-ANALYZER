import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`ALTER TABLE "Resume" ADD COLUMN IF NOT EXISTS pdf_data TEXT`;
console.log("✅ pdf_data column added to Resume table");
