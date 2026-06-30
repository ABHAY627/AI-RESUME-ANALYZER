import { Link } from "react-router";
import { lazy, Suspense } from "react";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { resumes as demoResumes } from "../../resumeData";
import { requireUser } from "~/lib/session.server";
import { sql } from "~/lib/db.server";
import type { Route } from "./+types/resume";

const PdfViewer = lazy(() => import("~/components/PdfViewer"));

export const meta = () => [
  { title: "ResumeXpert | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id } = params;

  // Static demo resumes — no auth required
  const demo = demoResumes.find((r) => r.id === id);
  if (demo) {
    return {
      resume: {
        id: demo.id,
        pdfData: null as string | null,
        imageUrl: demo.imagePath,
        companyName: demo.companyName ?? "",
        jobTitle: demo.jobTitle ?? "",
        feedback: demo.feedback as Feedback,
      },
      isDemo: true,
    };
  }

  // Real resumes — auth required
  const user = await requireUser(request);
  const rows = await sql()`SELECT * FROM "Resume" WHERE id = ${id} LIMIT 1`;
  const resume = rows[0] as DbResume | undefined;

  if (!resume || resume.user_id !== user.id) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    resume: {
      id: resume.id,
      pdfData: (resume as unknown as { pdf_data: string | null }).pdf_data ?? null,
      companyName: resume.company_name,
      jobTitle: resume.job_title,
      feedback: resume.feedback as unknown as Feedback,
    },
    isDemo: false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type LoaderData = Awaited<ReturnType<typeof loader>>;

export default function ResumePage({ loaderData }: Route.ComponentProps) {
  const { resume, isDemo } = loaderData as LoaderData;
  const { pdfData, feedback, companyName, jobTitle } = resume;
  const imageUrl = (resume as { imageUrl?: string }).imageUrl;

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-gray-800">{companyName}</p>
          <p className="text-sm text-gray-500">{jobTitle}</p>
        </div>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* ── Left: PDF panel ────────────────────────── */}
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 flex items-center justify-center">
          <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] w-full max-w-xl overflow-hidden">
            {isDemo && imageUrl ? (
              <img
                src={imageUrl}
                className="w-full h-full object-contain rounded-2xl"
                title="resume"
                alt="resume preview"
              />
            ) : pdfData ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <img src="/images/resume-scan-2.gif" className="w-48" alt="loading" />
                </div>
              }>
                <PdfViewer base64Data={pdfData} />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full">
                <img src="/images/resume-scan-2.gif" className="w-48" alt="loading" />
              </div>
            )}
          </div>
        </section>

        {/* ── Right: feedback panel ──────────────────────────── */}
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS?.score ?? 0}
                suggestions={feedback.ATS?.tips ?? []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <p className="text-amber-700 font-semibold text-lg mb-1">AI Analysis Unavailable</p>
                <p className="text-amber-600 text-sm">
                  Your resume was uploaded successfully but the AI analysis could not be completed —
                  likely due to an API quota limit. Your PDF is shown on the left.
                </p>
              </div>
              <p className="text-sm text-gray-400 text-center">
                Fix your Gemini API key and{" "}
                <Link to="/upload" className="text-indigo-500 hover:underline">
                  upload again
                </Link>{" "}
                to get feedback.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
