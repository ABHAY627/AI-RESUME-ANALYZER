import { requireUser } from "~/lib/session.server";
import { db } from "~/lib/db.server";
import type { Route } from "./+types/resume-pdf";

export async function loader({ request, params }: Route.LoaderArgs) {
    const { id } = params;
    const user = await requireUser(request);
    const resume = await db.resume.findUnique({ where: { id } });

    if (!resume || resume.userId !== user.id) {
        throw new Response("Not Found", { status: 404 });
    }

    if (!resume.pdfUrl) {
        throw new Response("No PDF available", { status: 404 });
    }

    // Stream directly from Vercel Blob — avoids buffering entire PDF in memory
    const response = await fetch(resume.pdfUrl);

    if (!response.ok) {
        throw new Response("Failed to fetch PDF", { status: 502 });
    }

    // Pass the stream through with corrected headers
    return new Response(response.body, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            "X-Frame-Options": "SAMEORIGIN",
            "Cache-Control": "private, max-age=3600",
        },
    });
}

export default function ResumePdf() {
    return null;
}
