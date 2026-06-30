import type { Route } from "./+types/home";
import Navbar from '../components/Navbar';
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "../../resumeData";
import { usePuterStore } from "~/lib/puter";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeXpert" },
    { name: "description", content: "Smartest feedback to land your dream job !" },
  ];
}

export default function Home() {
    const { auth } = usePuterStore();

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>

        {resumes.length > 0 ? (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-gray-400">
            <img src="/images/resume-scan-2.gif" className="w-48 opacity-50" alt="no resumes" />
            <p className="text-xl">No resumes yet. Upload one to get started!</p>
            <Link to="/upload" className="primary-button w-fit px-8">
              Upload Resume
            </Link>
          </div>
        )}
      </section>

      <section className="main-section">
        <Link
          to="/wipe"
          className="text-sm text-gray-400 hover:text-red-500 underline underline-offset-4 transition-colors duration-200"
        >
          Wipe App Data
        </Link>
      </section>
    </main>
  );
}
