import { redirect } from "react-router";
import { requireUser } from "~/lib/session.server";
import { sql } from "~/lib/db.server";
import type { Route } from "./+types/resume-pdf";

export async function loader({ request, params }: Route.LoaderArgs) {
    const { id } = params;
    const user = await requireUser(request);

    const rows = await sql()`SELECT pdf_url, user_id FROM "Resume" WHERE id = ${id} LIMIT 1`;
    const resume = rows[0] as { pdf_url: string; user_id: string } | undefined;

    if (!resume || resume.user_id !== user.id) {
        throw new Response("Not Found", { status: 404 });
    }

    if (!resume.pdf_url) {
        throw new Response("No PDF available", { status: 404 });
    }

    // Redirect directly to the Vercel Blob URL
    // The iframe loads it cross-origin — use <embed> on the client side instead of <iframe>
    // to avoid X-Frame-Options issues
    throw redirect(resume.pdf_url);
}

export default function ResumePdf() {
    return null;
}
