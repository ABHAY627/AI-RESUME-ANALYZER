import { redirect } from "react-router";
import { getUserFromRequest } from "~/lib/auth.server";

export type AuthUser = { id: string; email: string };

/**
 * Requires an authenticated user. Throws a redirect to /auth if not logged in.
 */
export async function requireUser(request: Request): Promise<AuthUser> {
  const user = getUserFromRequest(request);
  if (!user) {
    const url = new URL(request.url);
    const next = encodeURIComponent(url.pathname + url.search);
    throw redirect(`/auth?next=${next}`);
  }
  return user;
}

/**
 * Returns the authenticated user or null — never redirects.
 */
export function optionalUser(request: Request): AuthUser | null {
  return getUserFromRequest(request);
}
