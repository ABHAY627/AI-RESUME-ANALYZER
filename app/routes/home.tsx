import { Link } from "react-router";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { resumes as demoResumes } from "../../resumeData";
import { optionalUser } from "~/lib/session.server";
import { db } from "~/lib/db.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeXpert" },
    {
      name: "description",
      content: "Smartest feedback to land your dream job!",
    },
  ];
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const user = optionalUser(request);

  let userResumes: {
    id: string;
    companyName: string;
    jobTitle: string;
    pdfUrl: string;
    feedback: unknown;
  }[] = [];

  if (user) {
    userResumes = await db.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        jobTitle: true,
        pdfUrl: true,
        feedback: true,
      },
    });
  }

  return {
    user: user
      ? await db.user
          .findUnique({ where: { id: user.id }, select: { name: true, email: true } })
          .then((u: { name: string | null; email: string } | null) => u ?? null)
      : null,
    userResumes,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type LoaderData = Awaited<ReturnType<typeof loader>>;

// Cards shown: static demos always first, then real user resumes
export default function Home({ loaderData }: Route.ComponentProps) {
  const { user, userResumes } = loaderData as LoaderData;

  // Map demo resumes to unified card shape
  const demoCards = demoResumes.map((r) => ({
    id: r.id,
    companyName: r.companyName ?? "",
    jobTitle: r.jobTitle ?? "",
    imagePath: r.imagePath,
    feedback: r.feedback as Feedback | null,
    isDemo: true,
  }));

  // Map DB resumes to unified card shape
  const dbCards = userResumes.map((r) => ({
    id: r.id,
    companyName: r.companyName,
    jobTitle: r.jobTitle,
    imagePath: "/images/pdf.png",
    feedback: (r.feedback ?? null) as Feedback | null,
    isDemo: false,
  }));

  const allCards = [...demoCards, ...dbCards];

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar user={user} />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications &amp; Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>

        {allCards.length > 0 ? (
          <div className="resumes-section">
            {allCards.map((card) => (
              <ResumeCard
                key={card.id}
                resume={{
                  id: card.id,
                  companyName: card.companyName,
                  jobTitle: card.jobTitle,
                  imagePath: card.imagePath,
                  feedback: card.feedback,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-gray-400">
            <img
              src="/images/resume-scan-2.gif"
              className="w-48 opacity-50"
              alt="no resumes"
            />
            <p className="text-xl">
              No resumes yet. Upload one to get started!
            </p>
            <Link to="/upload" className="primary-button w-fit px-8">
              Upload Resume
            </Link>
          </div>
        )}
      </section>

      {user && (
        <section className="main-section">
          <Link
            to="/wipe"
            className="text-sm text-gray-400 hover:text-red-500 underline underline-offset-4 transition-colors duration-200"
          >
            Wipe App Data
          </Link>
        </section>
      )}
    </main>
  );
}
