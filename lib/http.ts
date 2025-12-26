import { NextResponse } from "next/server";
import { security } from "@/lib/security";

export function jsonOk<T extends object>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 500, detail?: unknown, extra?: Record<string, unknown>) {
  const base: Record<string, unknown> = { ok: false, error: message, ...(extra || {}) };
  if (security.errorMasking === "off") {
    const safeDetail = detail instanceof Error ? detail.message : detail;
    return NextResponse.json({ ...base, detail: safeDetail }, { status });
  }
  return NextResponse.json(base, { status });
}
