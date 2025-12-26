import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";

const encoder = new TextEncoder();

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short. Set it in .env");
  }
  return encoder.encode(secret);
}

export function getCookieName() {
  return process.env.AUTH_COOKIE_NAME || "session";
}

export type Session = {
  userId: string;
  email: string;
};

export async function createSessionToken(session: Session) {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ ...session } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const userId = payload.userId;
    const email = payload.email;
    if (typeof userId !== "string" || typeof email !== "string") return null;
    return { userId, email };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
