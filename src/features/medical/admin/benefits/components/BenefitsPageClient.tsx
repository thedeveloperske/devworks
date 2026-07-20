"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BenefitForm } from "./BenefitForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  benefitToFormValues,
  type BenefitFormData,
  type BenefitListItem,
} from "@/features/medical/admin/benefits";
import { beneClassOptions } from "@/features/medical/lookups";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type BenefitsPageClientProps = {
  benefits: BenefitListItem[];
};

type EditBenefitState = {
  id: string;
  benefit: BenefitFormData | null;
  name: string;
  error: string;
};

export function BenefitsPageClient({ benefits }: BenefitsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const benefitModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || benefitModalOpen;

  const [editState, setEditState] = useState<EditBenefitState | null>(null);

  const beneClassLabelById = useMemo(
    () =>
      Object.fromEntries(
        beneClassOptions.map((option) => [option.value, option.label])
      ),
    []
  );

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical/selection-items");
  }, [router]);

  const closeBenefitModal = useCallback(() => {
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
      router.push(`${pathname}?manage=1&edit=${id}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleSaved = useCallback(() => {
    closeBenefitModal();
    router.refresh();
  }, [closeBenefitModal, router]);

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

    fetch(`/api/medical/benefits/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load benefit");
        }
        return res.json();
      })
      .then((benefit) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          benefit: benefitToFormValues(benefit),
          name: benefit.benefit,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          benefit: null,
          name: "",
          error: error instanceof Error ? error.message : "Failed to load benefit",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editBenefit = editState?.id === editId ? editState.benefit : null;
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingBenefit = editId
    ? benefits.find((benefit) => benefit.id === editId)
    : undefined;

  const compactThClass =
    "px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass = "px-2.5 py-1.5 text-[12px] text-slate-600";
  const compactEmptyCellClass = "px-2.5 py-4 text-center text-[12px] text-slate-500";

  const benefitsTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Benefit</th>
            <th className={compactThClass}>Bene Class</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {benefits.length === 0 ? (
            <tr>
              <td colSpan={2} className={compactEmptyCellClass}>
                No benefits found.{" "}
                <button type="button" onClick={openNewModal} className="text-maroon hover:underline">
                  Create one
                </button>
              </td>
            </tr>
          ) : (
            benefits.map((benefit) => (
              <tr key={benefit.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(benefit.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {benefit.benefit}
                  </button>
                </td>
                <td className={compactTdClass}>
                  {benefit.beneClass
                    ? (beneClassLabelById[benefit.beneClass] ?? benefit.beneClass)
                    : "—"}
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
          title="Benefits"
          description="Open Benefit Management from Selection Items to view and edit benefits"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Benefit Management"
        description="Manage Benefits"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 justify-end">
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Benefit
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{benefitsTable}</div>
        </div>
      </Modal>

      <Modal
        open={benefitModalOpen}
        onClose={closeBenefitModal}
        title={isNew ? "New Benefit" : "Edit Benefit"}
        description={
          isNew
            ? "Register a new benefit"
            : editName || editingBenefit?.benefit || "Update benefit details"
        }
      >
        {isNew ? (
          <BenefitForm embedded onSuccess={handleSaved} onCancel={closeBenefitModal} />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading benefit...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editBenefit && editId ? (
          <BenefitForm
            key={editId}
            embedded
            benefitId={editId}
            initial={editBenefit}
            onSuccess={handleSaved}
            onCancel={closeBenefitModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
