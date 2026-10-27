import { BulkOrderInstructions, CampaignBanner, CategoryIntro, ContactPanel, FaqSection, ProductEducation, QuoteRequestInfo, ServiceHighlights, StoreLocatorIntro } from "@/components/cms/blocks";
import { Hero } from "@/components/cms/Hero";
import { Promotions } from "@/components/cms/Promotions";

/**
 * Makeswift component registration (UNVERIFIED against a live Makeswift site).
 *
 * @makeswift/runtime is intentionally NOT installed: it needs a Makeswift site and API
 * key, and the registration API must be checked against the version you install. This
 * file declares the component catalog in a runtime-agnostic way; wire it with:
 *
 *   import { ReactRuntime } from "@makeswift/runtime/react";
 *   import { Style, TextInput, List, Group } from "@makeswift/runtime/controls";
 *   registerAll(runtime, { Style, TextInput });   // see docs/ARCHITECTURE.md
 *
 * Only presentation props are exposed. CMS content can never alter authorization,
 * pricing, credit decisions or transaction rules.
 */
export interface CmsComponentDef {
  type: string;
  label: string;
  component: React.ComponentType<never> | React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Names of editable props (all optional - defaults live in the component). */
  props: string[];
}

export const CMS_COMPONENTS: CmsComponentDef[] = [
  { type: "vpg-hero", label: "Homepage hero", component: Hero, props: [] },
  { type: "vpg-promotions", label: "Promotional tiles", component: Promotions, props: [] },
  { type: "vpg-campaign-banner", label: "Campaign banner", component: CampaignBanner, props: ["text", "ctaLabel", "ctaHref", "tone"] },
  { type: "vpg-service-highlights", label: "B2B service highlights", component: ServiceHighlights, props: ["items"] },
  { type: "vpg-bulk-instructions", label: "Bulk-order instructions", component: BulkOrderInstructions, props: ["title", "items", "footnote"] },
  { type: "vpg-quote-info", label: "Quote request info", component: QuoteRequestInfo, props: ["title", "items", "footnote"] },
  { type: "vpg-store-locator-intro", label: "Store locator intro", component: StoreLocatorIntro, props: ["title", "body"] },
  { type: "vpg-faq", label: "FAQs / help", component: FaqSection, props: ["title", "items"] },
  { type: "vpg-contact", label: "Contact panel", component: ContactPanel, props: ["title", "phone", "email", "hours"] },
  { type: "vpg-product-education", label: "Product education", component: ProductEducation, props: ["title", "body"] },
  { type: "vpg-category-intro", label: "Category introduction", component: CategoryIntro, props: ["title", "body"] },
];

/** Minimal runtime surface so this file compiles without @makeswift/runtime. */
export interface RuntimeLike {
  registerComponent: (component: unknown, meta: { type: string; label: string; props: Record<string, unknown> }) => void;
}

export function registerAll(runtime: RuntimeLike, controls: { TextInput: (o: { label: string; defaultValue?: string }) => unknown }) {
  for (const c of CMS_COMPONENTS) {
    const props = Object.fromEntries(c.props.filter((p) => p !== "items").map((p) => [p, controls.TextInput({ label: p })]));
    runtime.registerComponent(c.component, { type: c.type, label: c.label, props });
  }
}
