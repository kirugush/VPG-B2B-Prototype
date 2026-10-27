import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { CATEGORIES } from "@/mocks/data";

export function generateStaticParams() { return CATEGORIES.map((c) => ({ slug: c.slug })); }

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();
  return (
    <div>
      <nav className="mb-3 text-sm text-slate-500"><Link href="/" className="hover:underline">Home</Link> / {cat.name}</nav>
      <Suspense fallback={null}><Catalog category={cat.slug} title={cat.name} /></Suspense>
    </div>
  );
}
