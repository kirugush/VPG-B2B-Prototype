import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { VpgLogo } from "./Logo";
import { FOOTER } from "./cms/content";

export function Footer() {
  const icons = { Facebook, Instagram, X: Twitter, LinkedIn: Linkedin } as const;
  return (
    <footer className="mt-12 bg-black text-gray-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded bg-white p-2"><VpgLogo className="h-9" /></div>
          <p className="mt-3 text-sm text-slate-300">{FOOTER.tagline}</p>
          <div className="mt-4 flex gap-3">
            {FOOTER.social.map((s) => { const I = icons[s.name as keyof typeof icons]; return I ? (<a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="rounded-full bg-alpha-white-10 p-2 hover:bg-alpha-white-20"><I className="h-4 w-4" /></a>) : (<a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="rounded-full bg-alpha-white-10 px-3 py-1.5 text-xs hover:bg-alpha-white-20">{s.name}</a>); })}
          </div>
        </div>
        {FOOTER.columns.map((c) => (
          <div key={c.title}>
            <h3 className="mb-3 font-semibold text-white">{c.title}</h3>
            <ul className="space-y-2 text-sm">{c.links.map((l) => (<li key={l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>))}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-alpha-white-10 py-4 text-center text-xs text-slate-400">{FOOTER.copyright} · Payments: {FOOTER.payments.join(", ")}</div>
    </footer>
  );
}
