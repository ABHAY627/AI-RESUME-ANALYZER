import Navbar from "~/components/Navbar";
import {useState} from "react";
import FileUploader from "~/components/FileUploader";

const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File) => {
        setFile(file);

    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form: HTMLFormElement | null = e.currentTarget.closest('form');
        if (!form) return;

        const formData = new FormData(form);

        const companyName: FormDataEntryValue | null = formData.get('company-name');
        const jobTitle: FormDataEntryValue | null = formData.get('job-title');
        const jobDescription: FormDataEntryValue | null = formData.get('job-description');

        console.log({
            companyName,
            jobTitle,
            jobDescription,
            file
        });

    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">

            <Navbar/>

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>
                        Smart feedback for your dream job
                    </h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="~/images/resume-scan.gif" className="w-full"/>
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score an improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" id="company-name" placeholder="Company Name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Tilte</label>
                                <input type="text" name="job-title" id="job-title" placeholder="Job Title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" id="job-description" placeholder="Job Description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button type="submit" className="primary-button">Analyze Resume</button>

                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload