import { useEffect, useState } from "react";

interface PdfViewerProps {
    base64Data: string;
}

const PdfViewer = ({ base64Data }: PdfViewerProps) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!base64Data) return;

        // Convert base64 → Uint8Array → Blob → object URL
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [base64Data]);

    if (!objectUrl) {
        return (
            <div className="flex items-center justify-center h-full">
                <img src="/images/resume-scan-2.gif" className="w-32" alt="loading" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <embed
                src={objectUrl}
                type="application/pdf"
                className="w-full flex-1 rounded-2xl"
            />
            <div className="flex justify-center py-2 shrink-0">
                <a
                    href={objectUrl}
                    download="resume.pdf"
                    className="text-xs text-indigo-500 hover:underline"
                >
                    ↓ Download PDF
                </a>
            </div>
        </div>
    );
};

export default PdfViewer;
