/**
 * CMS content model.
 *
 * In production these blocks are authored in Makeswift (register each component
 * with `runtime.registerComponent` and expose the props below as controls), so
 * marketing can edit them without a deploy. This file is the typed fallback /
 * seed content and documents the prop shape for each Makeswift component.
 */
export const HERO = {
  eyebrow: "Trade portal",
  heading: "Genuine-quality ice machine parts, delivered fast.",
  body: "Order Manitowoc, Scotsman, Hoshizaki and Ice-O-Matic compatible parts on account, with live credit and stock visibility.",
  cta: { label: "Shop all parts", href: "/search?q=" },
  secondary: { label: "View my orders", href: "/account/orders" },
};

export const PROMOTIONS = [
  { title: "10% off cleaning & sanitisers", body: "Use code VPG10 at checkout on your next order.", href: "/category/cleaning", tone: "from-brand-600 to-brand-900" },
  { title: "Free freight on orders over $500", body: "Standard shipping on eligible parcels.", href: "/search?q=", tone: "from-accent-500 to-red-800" },
  { title: "Annual maintenance kits", body: "Service your fleet before summer peak.", href: "/category/cleaning", tone: "from-emerald-600 to-emerald-900" },
];

export const FOOTER = {
  tagline: "VPG Group – trade supply for Fiji and the Pacific.",
  social: [
    { name: "Facebook", href: "https://facebook.com/vinodpatel.fj" },
    { name: "Instagram", href: "https://instagram.com/vinodpatelfiji" },
    { name: "X", href: "https://x.com/vpfiji" },
    { name: "LinkedIn", href: "https://linkedin.com/company/vinodpatelgroup" },
    { name: "TikTok", href: "https://tiktok.com/@vinodpatelfj" },
  ],
  columns: [
    { title: "About Us", links: [{ label: "Our Story", href: "#" }, { label: "VPG Group", href: "#" }, { label: "Careers", href: "#" }, { label: "Blogs", href: "#" }] },
    { title: "Shopping Help", links: [{ label: "Terms of Service", href: "#" }, { label: "Privacy Policies", href: "#" }, { label: "Help Center", href: "#" }, { label: "Contact Us", href: "#" }] },
    { title: "My Account", links: [{ label: "Dashboard", href: "/account" }, { label: "Orders", href: "/account/orders" }, { label: "Invoices", href: "/account/invoices" }, { label: "Shopping Lists", href: "/account/shopping-lists" }] },
  ],
  payments: ["Visa", "Mastercard", "Mpaisa"],
  copyright: "© 2025 VPG Group. All rights reserved.",
};
