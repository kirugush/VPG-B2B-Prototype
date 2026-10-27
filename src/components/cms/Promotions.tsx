import Link from "next/link";
import { PROMOTIONS } from "./content";

export function Promotions() {
  return (
    <section aria-labelledby="promos">
      <h2 id="promos" className="mb-3 text-xl font-bold">Promotions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {PROMOTIONS.map((p) => (
          <Link key={p.title} href={p.href} className={`rounded-lg bg-gradient-to-br ${p.tone} p-5 text-white transition hover:scale-[1.02]`}>
            <h3 className="text-lg font-bold">{p.title}</h3>
            <p className="mt-1 text-sm text-alpha-white-80">{p.body}</p>
            <span className="mt-3 inline-block text-sm font-semibold underline">Shop now</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
