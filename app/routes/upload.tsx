import { useRef, useState, useEffect } from "react";
import { redirect, useFetcher } from "react-router";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { requireUser } from "~/lib/session.server";
import { sql } from "~/lib/db.server";
import { env } from "~/lib/env.server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prepareInstructions } from "../../resumeData";
import type { Route } from "./+types/upload";


export const meta = () => [
    { title: "ResumeXpert | Upload" },
    { name: "description", content: "Upload your resume for AI feedback" },
];

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return { user: { id: user.id, email: user.email } };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stripCodeFences(text: string): string {
    return text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
}

function extractJsonSubstring(text: string): string | null {
    const objStart = text.indexOf("{");
    const objEnd = text.lastIndexOf("}");
    if (objStart !== -1 && objEnd > objStart) return text.slice(objStart, objEnd + 1);
    const arrStart = text.indexOf("[");
    const arrEnd = text.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd > arrStart) return text.slice(arrStart, arrEnd + 1);
    return null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-1.5-flash";

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return { error: "Failed to parse form data." };
    }

    const companyName = (formData.get("company-name") as string | null)?.trim() ?? "";
    const jobTitle    = (formData.get("job-title")    as string | null)?.trim() ?? "";
    const jobDescription = (formData.get("job-description") as string | null)?.trim() ?? "";
    const file = formData.get("resume-file") as File | null;

    if (!companyName || !jobTitle) return { error: "Company name and job title are required." };
    if (!file || file.size === 0)  return { error: "Please upload a valid PDF resume." };
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return { error: "Only PDF files are supported." };

    // Upload PDF
    const pdfBuffer = await file.arrayBuffer();
    const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

    // Idempotency — reuse existing record ONLY if it already has feedback.
    const idempotencyKey = `${user.id}-${slugify(companyName)}-${slugify(jobTitle)}`;
    const existingRows = await sql()`SELECT id, feedback FROM "Resume" WHERE idempotency_key = ${idempotencyKey} LIMIT 1`;
    if (existingRows[0]) {
        const existing = existingRows[0] as { id: string; feedback: unknown | null };
        if (existing.feedback) {
            return { redirectTo: `/resume/${existing.id}` };
        }
        // Previous upload had no AI feedback — delete so we can retry
        await sql()`DELETE FROM "Resume" WHERE id = ${existing.id}`;
    }

    // ── Save to DB ───────────────────────────────────────────────────────────
    const resumeRows = await sql()`
        INSERT INTO "Resume" (id, user_id, company_name, job_title, job_description, pdf_url, image_url, pdf_data, feedback, idempotency_key)
        VALUES (gen_random_uuid()::text, ${user.id}, ${companyName}, ${jobTitle}, ${jobDescription}, '', '', ${base64Pdf}, NULL, ${idempotencyKey})
        RETURNING id
    `;
    const resumeId = (resumeRows[0] as { id: string }).id;

    // ── Gemini AI analysis (single model: gemini-1.5-flash) ──────────────────
    try {
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const prompt = prepareInstructions({ jobTitle, jobDescription });

        console.log(`[Gemini] Calling ${GEMINI_MODEL}...`);
        const result = await model.generateContent([
            { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
            prompt,
        ]);
        const raw = await result.response.text();
        console.log(`[Gemini] ✅ Got response from ${GEMINI_MODEL}`);

        const cleaned = stripCodeFences(raw);
        let feedback: any = null;

        try {
            feedback = JSON.parse(cleaned);
        } catch {
            const candidate = extractJsonSubstring(cleaned);
            if (candidate) {
                try { feedback = JSON.parse(candidate); } catch { /* ignore */ }
            }
        }

        if (feedback) {
            await sql()`UPDATE "Resume" SET feedback = ${JSON.stringify(feedback)}::jsonb, raw_ai_text = ${cleaned}, raw_ai_response = ${JSON.stringify(feedback)}::jsonb WHERE id = ${resumeId}`;
            console.log(`[Gemini] ✅ Feedback saved for resume ${resumeId}`);
        } else {
            await sql()`UPDATE "Resume" SET raw_ai_text = ${cleaned} WHERE id = ${resumeId}`;
            console.error("[Gemini] Could not parse feedback JSON");
        }
    } catch (err) {
        console.error(`[Gemini] ${GEMINI_MODEL} failed:`, err);
    }

    // Always redirect to the resume page — shows analysis if available, or "unavailable" message
    return { redirectTo: `/resume/${resumeId}` };
}

// ─── Component ────────────────────────────────────────────────────────────────

type ActionResult = { redirectTo: string } | { error: string } | undefined;

export default function Upload() {
    const fetcher  = useFetcher<ActionResult>();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);

    const isSubmitting = fetcher.state !== "idle";
    const data  = fetcher.data as ActionResult;
    const error = data && "error" in data ? data.error : null;

    // Handle redirect returned from action
    useEffect(() => {
        if (data && "redirectTo" in data) {
            navigate(data.redirectTo);
        }
    }, [data]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData(e.currentTarget);
        formData.set("resume-file", file, file.name); // attach dropzone file

        fetcher.submit(formData, {
            method: "post",
            encType: "multipart/form-data",
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>

                    {isSubmitting ? (
                        <>
                            <h2>Analyzing your resume, please wait…</h2>
                            <img
                                src="/images/resume-scan.gif"
                                className="w-full max-w-sm mx-auto"
                                alt="analyzing"
                            />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm w-full max-w-xl">
                            {error}
                        </div>
                    )}

                    {!isSubmitting && (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8 w-full max-w-xl"
                        >
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input
                                    type="text"
                                    name="company-name"
                                    id="company-name"
                                    placeholder="e.g. Google"
                                    required
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    id="job-title"
                                    placeholder="e.g. Frontend Developer"
                                    required
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea
                                    rows={5}
                                    name="job-description"
                                    id="job-description"
                                    placeholder="Paste the job description here (optional)"
                                />
                            </div>
                            <div className="form-div">
                                <label>Upload Resume (PDF)</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={!file || isSubmitting}
                            >
                                {file ? "Analyze Resume" : "Select a PDF first"}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );

    function handleFileSelect(selected: File | null) {
        setFile(selected);
    }
}
