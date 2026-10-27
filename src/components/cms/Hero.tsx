import Link from "next/link";
import { HERO } from "./content";

/** Makeswift-editable: register with runtime.registerComponent(Hero, { type: "vpg-hero", props: {...} }). */
export function Hero() {
  return (
    <section className="overflow-hidden rounded-xl bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 p-8 text-white sm:p-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-sky-200">{HERO.eyebrow}</p>
      <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">{HERO.heading}</h1>
      <p className="mt-3 max-w-xl text-slate-200">{HERO.body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={HERO.cta.href} className="btn-accent">{HERO.cta.label}</Link>
        <Link href={HERO.secondary.href} className="btn border border-alpha-white-40 text-white hover:bg-alpha-white-10">{HERO.secondary.label}</Link>
      </div>
    </section>
  );
}
