import { NextResponse } from "next/server";

/** Tiny in-memory fixed-window rate limiter (per instance). Use API Gateway throttling in production. */
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, max = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return true; }
  h.n++;
  return h.n <= max;
}

export const clientKey = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

export function problem(status: number, code: string, message: string) {
  // Safe error body: no stack traces, no internals.
  return NextResponse.json({ error: { code, message } }, { status });
}

export const DATA_MODE_SERVER = process.env.NEXT_PUBLIC_DATA_MODE === "live" ? "live" : "mock";
