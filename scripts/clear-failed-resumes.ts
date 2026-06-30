import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    const result = await sql`DELETE FROM "Resume" WHERE feedback IS NULL RETURNING id`;
    console.log(`Deleted ${result.length} resume(s) with missing feedback.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
