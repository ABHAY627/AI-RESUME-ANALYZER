import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Key:", apiKey?.substring(0, 15) + "...");

// Test ALL available models including newest ones
const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-exp-1206",
];

const genAI = new GoogleGenerativeAI(apiKey);

for (const modelName of models) {
    console.log(`\nTesting: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello in one word.");
        const text = await result.response.text();
        console.log(`  ✅ WORKS! "${text.trim().substring(0, 50)}"`);
    } catch (err) {
        const status = err.status || "?";
        // Extract just the key part of the error
        const msg = err.message || "";
        const quotaMatch = msg.match(/limit: (\d+)/);
        console.log(`  ❌ FAILED (${status})${quotaMatch ? ` [limit: ${quotaMatch[1]}]` : ""}`);
        
        // Check if it's a different project quota
        if (msg.includes("FreeTier")) {
            console.log("  → Free tier quota. Need billing enabled or wait for reset.");
        }
    }
}
