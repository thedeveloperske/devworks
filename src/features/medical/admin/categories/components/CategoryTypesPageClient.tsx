"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CategoryTypeForm } from "./CategoryTypeForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  categoryTypeToFormValues,
  type CategoryTypeFormData,
  type CategoryTypeListItem,
} from "@/features/medical/admin/categories";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type CategoryTypesPageClientProps = {
  categories: CategoryTypeListItem[];
};

type EditCategoryTypeState = {
  id: string;
  category: CategoryTypeFormData | null;
  name: string;
  error: string;
};

export function CategoryTypesPageClient({ categories }: CategoryTypesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const categoryModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || categoryModalOpen;

  const [editState, setEditState] = useState<EditCategoryTypeState | null>(null);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical/selection-items?manage=1");
  }, [router]);

  const closeCategoryModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("edit");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const openNewModal = useCallback(() => {
    router.push(`${pathname}?manage=1&new=1`, { scroll: false });
  }, [pathname, router]);

  const openEditModal = useCallback(
    (id: string) => {
      router.push(`${pathname}?manage=1&edit=${encodeURIComponent(id)}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleSaved = useCallback(() => {
    closeCategoryModal();
    router.refresh();
  }, [closeCategoryModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editId) {
      setEditState(null);
      return;
    }

    let cancelled = false;
    setEditState(null);

    fetch(`/api/medical/categories/${encodeURIComponent(editId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load category");
        }
        return res.json();
      })
      .then((category) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          category: categoryTypeToFormValues(category),
          name: category.category,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          category: null,
          name: "",
          error: error instanceof Error ? error.message : "Failed to load category",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editCategory = editState?.id === editId ? editState.category : null;
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingCategory = editId
    ? categories.find((category) => category.id === editId)
    : undefined;

  const compactThClass =
    "px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass = "px-2.5 py-1.5 text-[12px] text-slate-600";
  const compactEmptyCellClass = "px-2.5 py-4 text-center text-[12px] text-slate-500";

  const categoriesTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Category</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {categories.length === 0 ? (
            <tr>
              <td className={compactEmptyCellClass}>
                No categories found.{" "}
                <button type="button" onClick={openNewModal} className="text-maroon hover:underline">
                  Create one
                </button>
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(category.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {category.category}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`relative ${modalOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={modalOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="Categories"
          description="Open Category Management from Selection Items to view and edit category codes"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Category Management"
        description="Manage Categories"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 justify-end">
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Category
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{categoriesTable}</div>
        </div>
      </Modal>

      <Modal
        open={categoryModalOpen}
        onClose={closeCategoryModal}
        title={isNew ? "New Category" : "Edit Category"}
        description={
          isNew
            ? "Register a new category code"
            : editName || editingCategory?.category || "Update category details"
        }
      >
        {isNew ? (
          <CategoryTypeForm embedded onSuccess={handleSaved} onCancel={closeCategoryModal} />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading category...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editCategory && editId ? (
          <CategoryTypeForm
            key={editId}
            embedded
            categoryId={editId}
            initial={editCategory}
            onSuccess={handleSaved}
            onCancel={closeCategoryModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
