import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
import { jsonError, jsonOk } from "@/lib/http";
import { security } from "@/lib/security";
import { createUser, findUserByEmail } from "@/lib/data";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`register:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests.", 429, undefined, { meta: { remaining: rl.remaining, resetAt: rl.resetAt } });
  }

  const body = await req.json().catch(() => null);
  let email: string | undefined;
  let password: string | undefined;
  if (security.validation === "on") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      log("warn", "register_validation_failed", { ip });
      return jsonError("Invalid input.", 400);
    }
    email = parsed.data.email;
    password = parsed.data.password;
  } else {
    email = typeof body?.email === "string" ? body.email : undefined;
    password = typeof body?.password === "string" ? body.password : undefined;
    if (!email || !password) return jsonError("Invalid input.", 400);
  }

  try {
    const exists = await findUserByEmail(email);
    if (exists) {
      return jsonError("Email already registered.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await createUser(email, passwordHash);

    log("info", "user_registered", { ip, emailHash: hashEmail(email) });
    return jsonOk({ ok: true, meta: { remaining: rl.remaining, resetAt: rl.resetAt }, dataAccess: security.dataAccess });
  } catch (e) {
    log("error", "register_error", { e });
    return jsonError("Server error.", 500, e);
  }
}

function hashEmail(email: string) {
  // Privacy-friendly: log only a stable hash
  const crypto = require("crypto") as typeof import("crypto");
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 12);
}
