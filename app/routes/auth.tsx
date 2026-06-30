import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { z } from "zod";
import { sql } from "~/lib/db.server";
import {
    hashPassword,
    verifyPassword,
    createToken,
    createAuthCookie,
    getUserFromRequest,
} from "~/lib/auth.server";
import type { Route } from "./+types/auth";

export const meta = () => [
    { title: "ResumeXpert | Sign In" },
    { name: "description", content: "Sign in or create an account" },
];

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
    const user = getUserFromRequest(request);
    if (user) throw redirect("/");
    const url = new URL(request.url);
    const next = url.searchParams.get("next") ?? "/";
    return { next };
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent") as "login" | "register";
    const next = (formData.get("next") as string) || "/";

    if (intent === "register") {
        const parsed = registerSchema.safeParse({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
        });
        if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, intent };

        const { name, email, password } = parsed.data;
        const existingRows = await sql()`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`;
        if (existingRows[0]) return { errors: { email: ["An account with this email already exists"] }, intent };

        const hashed = await hashPassword(password);
        const newRows = await sql()`
            INSERT INTO "User" (id, email, password, name)
            VALUES (gen_random_uuid()::text, ${email}, ${hashed}, ${name})
            RETURNING *
        `;
        const user = newRows[0] as DbUser;
        throw redirect(next, {
            headers: { "Set-Cookie": createAuthCookie(createToken(user.id, user.email)) },
        });
    }

    if (intent === "login") {
        const parsed = loginSchema.safeParse({
            email: formData.get("email"),
            password: formData.get("password"),
        });
        if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, intent };

        const { email, password } = parsed.data;
        const rows = await sql()`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
        const user = rows[0] as DbUser | undefined;
        if (!user) return { errors: { email: ["No account found with this email"] }, intent };

        const valid = await verifyPassword(password, user.password);
        if (!valid) return { errors: { password: ["Incorrect password"] }, intent };

        throw redirect(next, {
            headers: { "Set-Cookie": createAuthCookie(createToken(user.id, user.email)) },
        });
    }

    return { errors: { email: ["Invalid request"] }, intent: "login" as const };
}

// ─── Component ────────────────────────────────────────────────────────────────

type FieldErrors = { name?: string[]; email?: string[]; password?: string[] };
type ActionData = { errors: FieldErrors; intent: "login" | "register" } | undefined;

export default function Auth() {
    const { next } = useLoaderData<typeof loader>();
    const [mode, setMode] = useState<"login" | "register">("login");
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const errors = actionData && "errors" in actionData ? (actionData.errors as FieldErrors) : null;

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

                    {/* Top accent bar */}
                    <div className="h-1.5 w-full primary-gradient" />

                    <div className="px-8 py-10 flex flex-col gap-6">

                        {/* Header */}
                        <div className="flex flex-col items-center gap-1 text-center">
                            <p className="text-2xl font-bold text-gradient">ResumeXpert</p>
                            <h2 className="text-2xl font-semibold text-gray-800 mt-1">
                                {mode === "login" ? "Welcome back" : "Create account"}
                            </h2>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {mode === "login"
                                    ? "Sign in to continue your job journey"
                                    : "Start getting AI feedback on your resume"}
                            </p>
                        </div>

                        {/* Tab switcher */}
                        <div className="flex bg-gray-100 rounded-full p-1">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    mode === "login"
                                        ? "bg-white shadow text-gray-800"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("register")}
                                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    mode === "register"
                                        ? "bg-white shadow text-gray-800"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Form */}
                        <Form method="post" className="flex flex-col gap-4 w-full">
                            <input type="hidden" name="intent" value={mode} />
                            <input type="hidden" name="next" value={next} />

                            {mode === "register" && (
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-600">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Jane Doe"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-800 text-sm bg-gray-50"
                                    />
                                    {errors?.name && (
                                        <p className="text-red-500 text-xs mt-0.5">{errors.name[0]}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-sm font-medium text-gray-600">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-800 text-sm bg-gray-50"
                                />
                                {errors?.email && (
                                    <p className="text-red-500 text-xs mt-0.5">{errors.email[0]}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password" className="text-sm font-medium text-gray-600">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-800 text-sm bg-gray-50"
                                />
                                {errors?.password && (
                                    <p className="text-red-500 text-xs mt-0.5">{errors.password[0]}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl primary-gradient text-white font-semibold text-sm mt-1 transition-opacity disabled:opacity-60 cursor-pointer"
                            >
                                {isSubmitting
                                    ? "Please wait…"
                                    : mode === "login"
                                    ? "Sign In"
                                    : "Create Account"}
                            </button>
                        </Form>

                        {/* Footer note */}
                        <p className="text-center text-xs text-gray-400">
                            By continuing you agree to our{" "}
                            <span className="text-indigo-400">Terms of Service</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
