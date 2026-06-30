import { redirect } from "react-router";
import { clearAuthCookie } from "~/lib/auth.server";
import type { Route } from "./+types/logout";

export async function action(_: Route.ActionArgs) {
  throw redirect("/auth", {
    headers: { "Set-Cookie": clearAuthCookie() },
  });
}

// No UI — POST only
export default function Logout() {
  return null;
}
