import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { createSessionToken, getCookieName } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
import { jsonError } from "@/lib/http";
import { security } from "@/lib/security";
import { findUserByEmail } from "@/lib/data";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`login:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests.", 429, undefined, { meta: { remaining: rl.remaining, resetAt: rl.resetAt } });
  }

  const body = await req.json().catch(() => null);
  let email: string | undefined;
  let password: string | undefined;
  if (security.validation === "on") {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      log("warn", "login_validation_failed", { ip });
      return jsonError("Invalid input.", 400);
    }
    email = parsed.data.email;
    password = parsed.data.password;
  } else {
    email = typeof body?.email === "string" ? body.email : undefined;
    password = typeof body?.password === "string" ? body.password : undefined;
    if (!email || !password) return jsonError("Invalid input..", 400);
  }

  try {
    const user = await findUserByEmail(email);
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

    // Constant response shape + generic error to reduce user enumeration
    if (!ok || !user) {
      log("warn", "login_failed", { ip, emailHash: hashEmail(email) });
      return jsonError("Invalid credentials.", 401);
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      ok: true,
      meta: { remaining: rl.remaining, resetAt: rl.resetAt },
      dataAccess: security.dataAccess,
    });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    log("info", "login_success", { ip, emailHash: hashEmail(email) });
    return res;
  } catch (e) {
    log("error", "login_error", { ip });
    return jsonError("Server error.", 500, e);
  }
}

function hashEmail(email: string) {
  const crypto = require("crypto") as typeof import("crypto");
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 12);
}
