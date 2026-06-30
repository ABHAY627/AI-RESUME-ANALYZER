import { requireUser } from "~/lib/session.server";
import { db } from "~/lib/db.server";
import type { Route } from "./+types/resume-pdf";
import { env } from "~/lib/env.server";

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

  const response = await fetch(resume.pdfUrl, {
    headers: {
      Authorization: `Bearer ${env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Response("Failed to fetch PDF from blob storage", { status: 500 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
