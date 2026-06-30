import { useRef, useState, useEffect } from "react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { requireUser } from "~/lib/session.server";
import { uploadFile } from "~/lib/storage.server";
import { db } from "~/lib/db.server";
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

// ─── Action ───────────────────────────────────────────────────────────────────

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
    if (file.type !== "application/pdf") return { error: "Only PDF files are supported." };

    // Idempotency — only reuse if feedback was successfully generated
    const idempotencyKey = `${user.id}-${slugify(companyName)}-${slugify(jobTitle)}`;
    const existing = await db.resume.findUnique({ where: { idempotencyKey } });
    if (existing && existing.feedback !== null) {
        // Already analyzed successfully — return cached result
        return { redirectTo: `/resume/${existing.id}` };
    }
    // If existing but feedback is null, delete it and re-analyze
    if (existing && existing.feedback === null) {
        await db.resume.delete({ where: { id: existing.id } });
    }

    // Upload PDF
    const pdfBuffer = await file.arrayBuffer();
    const pdfBlob   = new Blob([pdfBuffer], { type: "application/pdf" });
    const filename  = `resumes/${user.id}/${Date.now()}-${slugify(companyName)}-${slugify(jobTitle)}.pdf`;

    let pdfUrl: string;
    try {
        pdfUrl = await uploadFile(pdfBlob, filename, "application/pdf");
    } catch (err) {
        console.error("[Blob]", err);
        return { error: "Failed to upload resume. Please try again." };
    }

    // Gemini
    const base64Pdf = Buffer.from(pdfBuffer).toString("base64");
    const genAI  = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = prepareInstructions({ jobTitle, jobDescription });

    let feedback: unknown = null;
    try {
        const result  = await model.generateContent([
            { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
            prompt,
        ]);
        const raw     = result.response.text();
        const cleaned = stripCodeFences(raw);
        feedback      = JSON.parse(cleaned);
    } catch (err) {
        console.error("[Gemini]", err);
        return { error: `AI analysis failed: ${err instanceof Error ? err.message : "unknown error"}. Please try again.` };
    }

    // Save
    const resume = await db.resume.create({
        data: {
            userId: user.id,
            companyName,
            jobTitle,
            jobDescription,
            pdfUrl,
            imageUrl: pdfUrl,
            feedback: feedback as object,
            idempotencyKey,
        },
    });

    return { redirectTo: `/resume/${resume.id}` };
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
