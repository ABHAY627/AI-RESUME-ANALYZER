import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)`;

await sql`
CREATE TABLE IF NOT EXISTS "Resume" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_description TEXT,
    pdf_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    feedback JSONB,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)`;

await sql`CREATE INDEX IF NOT EXISTS idx_resume_user_id ON "Resume"(user_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_resume_idempotency ON "Resume"(idempotency_key)`;

console.log("✅ Database tables created successfully");
