import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "~/lib/env.server";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Password utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT utilities ────────────────────────────────────────────────────────────

interface JwtPayload {
  userId: string;
  email: string;
}

export function createToken(userId: string, email: string): string {
  return jwt.sign({ userId, email } satisfies JwtPayload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

// ─── Cookie serialisation (manual — compatible with cookie v2) ───────────────

function buildCookieString(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
  }
): string {
  let str = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (options.path) str += `; Path=${options.path}`;
  if (options.maxAge != null) str += `; Max-Age=${options.maxAge}`;
  if (options.httpOnly) str += "; HttpOnly";
  if (options.secure) str += "; Secure";
  if (options.sameSite) str += `; SameSite=${options.sameSite}`;
  return str;
}

export function createAuthCookie(token: string): string {
  return buildCookieString(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(): string {
  return buildCookieString(COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// ─── Request helper ───────────────────────────────────────────────────────────

function parseCookieHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx < 0) continue;
    const key = decodeURIComponent(pair.slice(0, eqIdx).trim());
    const val = decodeURIComponent(pair.slice(eqIdx + 1).trim());
    result[key] = val;
  }
  return result;
}

export function getUserFromRequest(
  request: Request
): { id: string; email: string } | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return { id: payload.userId, email: payload.email };
}
