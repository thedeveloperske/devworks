import { Suspense } from "react";
import { CategoryTypesPageClient } from "@/features/medical/admin/categories/components";
import { loadCategoryTypesPageData } from "@/features/medical/admin/categories/server/load-page-data";

async function CategoryTypesContent() {
  const { categories } = await loadCategoryTypesPageData();
  return <CategoryTypesPageClient categories={categories} />;
}

export default function CategoryTypesPage() {
  return (
    <Suspense fallback={<div className="text-[12px] text-slate-500">Loading categories...</div>}>
      <CategoryTypesContent />
    </Suspense>
  );
}
