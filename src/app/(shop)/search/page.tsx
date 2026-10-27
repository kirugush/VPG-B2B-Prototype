import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";

export default function SearchPage() {
  return <Suspense fallback={null}><Catalog title="Search Results" showQuick /></Suspense>;
}
