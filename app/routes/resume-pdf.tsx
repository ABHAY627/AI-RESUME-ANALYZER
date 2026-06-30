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

    // Fetch from Vercel Blob (public URL — no auth header needed)
    const response = await fetch(resume.pdfUrl);

    if (!response.ok) {
        throw new Response("Failed to fetch PDF", { status: 502 });
    }

    const pdfBuffer = await response.arrayBuffer();

    return new Response(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            // Allow embedding in iframe from same origin
            "X-Frame-Options": "SAMEORIGIN",
            "Cache-Control": "private, max-age=3600",
        },
    });
}

// No UI component needed — this route only serves binary data
export default function ResumePdf() {
    return null;
}
