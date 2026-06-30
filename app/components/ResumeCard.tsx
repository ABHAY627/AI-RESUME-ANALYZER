import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

interface ResumeCardProps {
    resume: {
        id: string;
        companyName?: string;
        jobTitle?: string;
        imagePath: string;
        feedback: Feedback | null;
    };
}

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: ResumeCardProps) => {
    const score = feedback?.overallScore ?? 0;

    return (
        <Link
            to={`/resume/${id}`}
            className="resume-card animate-in fade-in duration-1000 hover:shadow-xl transition-shadow duration-300"
        >
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    <h2 className="!text-black font-bold break-words">
                        {companyName ?? "Untitled"}
                    </h2>
                    <h3 className="text-lg break-words text-gray-500">
                        {jobTitle ?? "Unknown Role"}
                    </h3>
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={score} />
                </div>
            </div>

            <div className="gradient-border animate-in fade-in duration-1000 flex-1 overflow-hidden">
                <div className="w-full h-full">
                    {imagePath.endsWith(".pdf") || imagePath.startsWith("https://") && imagePath.includes(".pdf") ? (
                        <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-50 rounded-xl">
                            <img src="/images/pdf.png" alt="PDF resume" className="w-16 h-16 opacity-40" />
                            <span className="ml-3 text-gray-400 text-sm">PDF Resume</span>
                        </div>
                    ) : (
                        <img
                            src={imagePath}
                            alt={`${companyName ?? "Resume"} preview`}
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top rounded-xl"
                        />
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ResumeCard;
