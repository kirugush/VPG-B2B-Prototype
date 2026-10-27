import type { CreditAccount } from "@/lib/types";

/** Server-side credit fixtures keyed by company id. The browser never supplies the limit. */
export const CREDIT_LIMITS: Record<string, { limit: number; status: CreditAccount["accountStatus"]; review: CreditAccount["reviewStatus"]; restrictions: string[] }> = {
  c1: { limit: 50000, status: "Good standing", review: "Scheduled", restrictions: ["Orders above $20,000 need Admin approval (demonstration rule)"] },
  c2: { limit: 15000, status: "On hold", review: "In progress", restrictions: ["Account on hold: overdue invoices"] },
  c3: { limit: 120000, status: "Good standing", review: "None", restrictions: [] },
  c4: { limit: 8000, status: "Under review", review: "In progress", restrictions: ["Limit under review"] },
};
