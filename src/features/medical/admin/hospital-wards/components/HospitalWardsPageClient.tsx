"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HospitalWardForm } from "./HospitalWardForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  hospitalWardToFormValues,
  type HospitalWardFormData,
  type HospitalWardListItem,
} from "@/features/medical/admin/hospital-wards";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type HospitalWardsPageClientProps = {
  wards: HospitalWardListItem[];
};

type EditHospitalWardState = {
  id: string;
  ward: HospitalWardFormData | null;
  name: string;
  error: string;
};

export function HospitalWardsPageClient({ wards }: HospitalWardsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const wardModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || wardModalOpen;

  const [editState, setEditState] = useState<EditHospitalWardState | null>(null);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical/selection-items?manage=1");
  }, [router]);

  const closeWardModal = useCallback(() => {
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
      router.push(`${pathname}?manage=1&edit=${encodeURIComponent(id)}`, {
        scroll: false,
      });
    },
    [pathname, router]
  );

  const handleSaved = useCallback(() => {
    closeWardModal();
    router.refresh();
  }, [closeWardModal, router]);

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

    fetch(`/api/medical/hospital-wards/${encodeURIComponent(editId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load hospital ward");
        }
        return res.json();
      })
      .then((ward) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          ward: hospitalWardToFormValues(ward),
          name: ward.ward,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          ward: null,
          name: "",
          error:
            error instanceof Error ? error.message : "Failed to load hospital ward",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editWard = editState?.id === editId ? editState.ward : null;
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingWard = editId
    ? wards.find((ward) => ward.id === editId)
    : undefined;

  const compactThClass =
    "px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass = "px-2.5 py-1.5 text-[12px] text-slate-600";
  const compactEmptyCellClass = "px-2.5 py-4 text-center text-[12px] text-slate-500";

  const wardsTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Code</th>
            <th className={compactThClass}>Ward</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {wards.length === 0 ? (
            <tr>
              <td colSpan={2} className={compactEmptyCellClass}>
                No hospital wards found.{" "}
                <button
                  type="button"
                  onClick={openNewModal}
                  className="text-maroon hover:underline"
                >
                  Create one
                </button>
              </td>
            </tr>
          ) : (
            wards.map((ward) => (
              <tr key={ward.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>{ward.code}</td>
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(ward.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {ward.ward}
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
          title="Hospital Ward"
          description="Open Hospital Ward from Selection Items to view and edit wards"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Hospital Ward"
        description="Manage hospital wards"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 justify-end">
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Ward
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{wardsTable}</div>
        </div>
      </Modal>

      <Modal
        open={wardModalOpen}
        onClose={closeWardModal}
        title={isNew ? "New Hospital Ward" : "Edit Hospital Ward"}
        description={
          isNew
            ? "Register a new hospital ward"
            : editName || editingWard?.ward || "Update hospital ward details"
        }
      >
        {isNew ? (
          <HospitalWardForm embedded onSuccess={handleSaved} onCancel={closeWardModal} />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading hospital ward...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editWard && editId ? (
          <HospitalWardForm
            key={editId}
            embedded
            wardId={editId}
            initial={editWard}
            onSuccess={handleSaved}
            onCancel={closeWardModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
