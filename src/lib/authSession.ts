import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET || "textra_fallback_secret_key_32chars_length";
export const SESSION_COOKIE_NAME = "textra_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  exp: number; // timestamp in ms
}

/**
 * Creates an HMAC-SHA256 signed session token (strictly valid for 24 hours / 1 day)
 */
export function signSessionToken(payload: Omit<SessionPayload, "exp">, expiresInHours = 24): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const jsonStr = JSON.stringify(fullPayload);
  const base64Data = Buffer.from(jsonStr, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(base64Data).digest("base64url");

  return `${base64Data}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 signed session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;

  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", SECRET).update(base64Data).digest("base64url");
    if (signature !== expectedSig) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Read session payload from incoming NextRequest or cookies
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    return verifySessionToken(cookie.value);
  }

  // Also check Bearer Authorization header if present
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return verifySessionToken(authHeader.substring(7));
  }

  return null;
}

/**
 * Read session payload in Next.js Server Components / Route Handlers
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    return verifySessionToken(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Attach session cookie to NextResponse (strictly 24 hours / 86400 seconds)
 */
export function setSessionCookie(res: NextResponse, token: string, maxAgeHours = 24): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeHours * 60 * 60, // 86400 seconds = strictly 24 hours / 1 day
  });
}

/**
 * Clear session cookie on NextResponse
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
