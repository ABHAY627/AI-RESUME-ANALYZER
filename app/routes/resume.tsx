import { useEffect, useState } from "react";
import {Link, useNavigate, useParams} from "react-router";
import {usePuterStore} from "~/lib/puter";
import auth from "~/routes/auth";

export const meta = () => ([
    { title: "ResumExpert | Review" },
    { name: "description", content: "Detailed overview of your resume" },
]);

const Resume = () => {
    const { id } = useParams();
    const { auth,isLoading,fs, kv } = usePuterStore();

    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    useEffect(()=>{
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    },[auth.isAuthenticated])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data = JSON.parse(resume);
            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;


            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeURL = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeURL);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageURL = URL.createObjectURL(imageBlob);
            setImageUrl(imageURL);

            setFeedback(data.feedback);
            console.log({resumeURL, imageURL});

        };

        loadResume();
    }, [id]);
    // dummy variable just to design the UI UX
    const variable = true;

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
                </Link>
            </nav>

            <div className="flex flex-col w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="feedback-section animate-in fade-in duration-1000 gradient-border max-sm-m:0 h-[90%] max-w-xl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    alt="Resume"
                                    className="w-full h-full object-cover rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">
                        Resume Review
                    </h2>
                    {variable /*feedback*/? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000 ">
                            Summary ATS Details
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="Scanning..." />
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
