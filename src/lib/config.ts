/**
 * Data mode toggle (the single switch between demo fixtures and live integrations).
 *
 *   NEXT_PUBLIC_DATA_MODE=mock   (default)  -> fixtures from src/mocks, clearly labelled "Demo data"
 *   NEXT_PUBLIC_DATA_MODE=live              -> real integrations only; NEVER falls back to mock success
 *
 * In live mode every module that has no wired integration shows an explicit error
 * instead of fabricated data.
 */
export type DataMode = "mock" | "live";

export const DATA_MODE: DataMode = process.env.NEXT_PUBLIC_DATA_MODE === "live" ? "live" : "mock";
export const IS_MOCK = DATA_MODE === "mock";

export const AWS_API_BASE_URL = process.env.NEXT_PUBLIC_AWS_API_BASE_URL ?? "";

/** Limits shared by client and server validation. */
export const LIMITS = {
  csvMaxBytes: 1_000_000,
  csvMaxRows: 500,
  pasteMaxRows: 500,
  creditTimeoutMs: 5_000,
  creditStaleMs: 30 * 60 * 1000,
} as const;
