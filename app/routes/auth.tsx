import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { z } from "zod";
import { db } from "~/lib/db.server";
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
    // Read `next` server-side so it's available during SSR
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

        if (!parsed.success) {
            return { errors: parsed.error.flatten().fieldErrors, intent };
        }

        const { name, email, password } = parsed.data;
        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
            return {
                errors: { email: ["An account with this email already exists"] },
                intent,
            };
        }

        const hashed = await hashPassword(password);
        const user = await db.user.create({
            data: { name, email, password: hashed },
        });

        throw redirect(next, {
            headers: { "Set-Cookie": createAuthCookie(createToken(user.id, user.email)) },
        });
    }

    if (intent === "login") {
        const parsed = loginSchema.safeParse({
            email: formData.get("email"),
            password: formData.get("password"),
        });

        if (!parsed.success) {
            return { errors: parsed.error.flatten().fieldErrors, intent };
        }

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return { errors: { email: ["No account found with this email"] }, intent };
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return { errors: { password: ["Incorrect password"] }, intent };
        }

        throw redirect(next, {
            headers: { "Set-Cookie": createAuthCookie(createToken(user.id, user.email)) },
        });
    }

    return { errors: { email: ["Invalid request"] }, intent: "login" as const };
}

// ─── Component ────────────────────────────────────────────────────────────────

type FieldErrors = {
    name?: string[];
    email?: string[];
    password?: string[];
};

type ActionData = { errors: FieldErrors; intent: "login" | "register" } | undefined;

export default function Auth() {
    const { next } = useLoaderData<typeof loader>();
    const [mode, setMode] = useState<"login" | "register">("login");
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const errors =
        actionData && "errors" in actionData
            ? (actionData.errors as FieldErrors)
            : null;

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10 w-[480px] max-w-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>
                            {mode === "login"
                                ? "Sign in to continue your job journey"
                                : "Create your account"}
                        </h2>
                    </div>

                    <Form method="post" className="flex flex-col gap-4 w-full">
                        <input type="hidden" name="intent" value={mode} />
                        <input type="hidden" name="next" value={next} />

                        {mode === "register" && (
                            <div className="form-div">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Jane Doe"
                                    required
                                />
                                {errors?.name && (
                                    <p className="text-red-500 text-sm">{errors.name[0]}</p>
                                )}
                            </div>
                        )}

                        <div className="form-div">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                            />
                            {errors?.email && (
                                <p className="text-red-500 text-sm">{errors.email[0]}</p>
                            )}
                        </div>

                        <div className="form-div">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                                required
                            />
                            {errors?.password && (
                                <p className="text-red-500 text-sm">{errors.password[0]}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-button text-xl mt-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Please wait..."
                                : mode === "login"
                                ? "Sign In"
                                : "Create Account"}
                        </button>
                    </Form>

                    <p className="text-center text-sm text-gray-500">
                        {mode === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode("register")}
                                    className="text-indigo-500 hover:underline font-medium"
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode("login")}
                                    className="text-indigo-500 hover:underline font-medium"
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </p>
                </section>
            </div>
        </main>
    );
}
