import { redirect } from "react-router";
import { getUserFromRequest, clearAuthCookie } from "~/lib/auth.server";
import { sql } from "~/lib/db.server";

export type AuthUser = { id: string; email: string };

/**
 * Requires an authenticated user.
 * Also validates the user still exists in the DB — clears stale cookies if not.
 */
export async function requireUser(request: Request): Promise<AuthUser> {
    const user = getUserFromRequest(request);
    if (!user) {
        const url = new URL(request.url);
        const next = encodeURIComponent(url.pathname + url.search);
        throw redirect(`/auth?next=${next}`);
    }

    // Verify the user still exists in DB (handles DB resets, deleted accounts)
    const rows = await sql()`SELECT id FROM "User" WHERE id = ${user.id} LIMIT 1`;
    if (!rows[0]) {
        // User in JWT no longer exists — clear cookie and redirect to auth
        const url = new URL(request.url);
        const next = encodeURIComponent(url.pathname + url.search);
        throw redirect(`/auth?next=${next}`, {
            headers: { "Set-Cookie": clearAuthCookie() },
        });
    }

    return user;
}

/**
 * Returns the authenticated user or null — never redirects.
 */
export function optionalUser(request: Request): AuthUser | null {
    return getUserFromRequest(request);
}
