import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log("=== AI Resume Analyzer Diagnostics ===\n");

// 1. Check env vars
console.log("--- Step 1: Environment Variables ---");
const apiKey = process.env.GEMINI_API_KEY;
const dbUrl = process.env.DATABASE_URL;
console.log("GEMINI_API_KEY:", apiKey ? `SET (${apiKey.length} chars, starts with "${apiKey.substring(0, 10)}...")` : "MISSING!");
console.log("DATABASE_URL:", dbUrl ? "SET" : "MISSING!");

// 2. Test Gemini API
console.log("\n--- Step 2: Gemini API Test ---");
try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Model created successfully");

    const result = await model.generateContent("Say 'hello' in one word. Return only the word.");
    const text = await result.response.text();
    console.log("Gemini API response:", JSON.stringify(text));
    console.log("✅ Gemini API is WORKING");
} catch (err) {
    console.error("❌ Gemini API FAILED:", err.message);
    if (err.message.includes("API_KEY_INVALID") || err.message.includes("API key")) {
        console.error("   → Your API key is INVALID. Get a new one from https://aistudio.google.com/apikey");
    } else if (err.message.includes("quota") || err.message.includes("429")) {
        console.error("   → API quota exceeded. Wait or upgrade your plan.");
    } else if (err.message.includes("fetch") || err.message.includes("network")) {
        console.error("   → Network error. Check your internet connection.");
    }
    console.error("   Full error:", err);
}

// 3. Test DB and check columns
console.log("\n--- Step 3: Database Column Check ---");
try {
    const sql = neon(dbUrl);
    const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Resume' 
        ORDER BY ordinal_position
    `;
    console.log("Resume table columns:");
    for (const col of cols) {
        console.log(`  - ${col.column_name} (${col.data_type})`);
    }

    // Check for required columns
    const colNames = cols.map(c => c.column_name);
    const requiredCols = ["pdf_data", "raw_ai_text", "raw_ai_response", "feedback"];
    for (const rc of requiredCols) {
        if (colNames.includes(rc)) {
            console.log(`  ✅ ${rc} exists`);
        } else {
            console.log(`  ❌ ${rc} MISSING! Run the migration.`);
        }
    }

    // Check existing resumes
    const resumes = await sql`SELECT id, feedback IS NOT NULL as has_feedback, company_name FROM "Resume" LIMIT 5`;
    console.log("\nExisting resumes:");
    for (const r of resumes) {
        console.log(`  - ${r.id}: company=${r.company_name}, has_feedback=${r.has_feedback}`);
    }
} catch (err) {
    console.error("❌ Database check FAILED:", err.message);
}

console.log("\n=== Diagnostics Complete ===");
