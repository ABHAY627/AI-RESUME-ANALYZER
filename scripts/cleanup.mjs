import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const r = await sql`DELETE FROM "Resume" WHERE feedback IS NULL RETURNING id, company_name`;
console.log("Deleted failed resumes:", r);
