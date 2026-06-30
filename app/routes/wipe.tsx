import { Form, redirect, useLoaderData } from "react-router";
import { db } from "~/lib/db.server";
import { requireUser } from "~/lib/session.server";
import type { Route } from "./+types/wipe";

export const meta = () => [
  { title: "ResumeXpert | Wipe Data" },
  { name: "description", content: "Delete all your analyzed resumes" },
];

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const count = await db.resume.count({ where: { userId: user.id } });
  return { count };
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  await db.resume.deleteMany({ where: { userId: user.id } });
  throw redirect("/");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WipeApp() {
  const { count } = useLoaderData<typeof loader>();

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-red-600">Wipe App Data</h2>
            <p className="text-gray-600">
              This will permanently delete all{" "}
              <strong>{count} analyzed resume{count !== 1 ? "s" : ""}</strong>{" "}
              from your account. This action cannot be undone.
            </p>
          </div>

          <Form method="post" className="flex flex-col gap-4 items-center">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-3 font-semibold transition-colors duration-200 cursor-pointer w-full"
            >
              Confirm Delete
            </button>
          </Form>

          <a
            href="/"
            className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-4 transition-colors duration-200"
          >
            Cancel, take me back
          </a>
        </section>
      </div>
    </main>
  );
}
