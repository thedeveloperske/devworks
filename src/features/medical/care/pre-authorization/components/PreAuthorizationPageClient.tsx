"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  preAuthorizationToFormValues,
  type PreAuthorizationFormData,
  type PreAuthorizationListItem,
} from "@/features/medical/care/pre-authorization";
import type { LookupOption } from "@/features/medical/lookups/types";
import { formatDate } from "@/lib/format";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";
import { PreAuthorizationForm } from "./PreAuthorizationForm";

type PreAuthorizationPageClientProps = {
  preAuthorizations: PreAuthorizationListItem[];
  providerOptions: LookupOption[];
  hospitalWardOptions: LookupOption[];
};

type EditState = {
  id: string;
  form: PreAuthorizationFormData | null;
  label: string;
  error: string;
};

export function PreAuthorizationPageClient({
  preAuthorizations,
  providerOptions,
  hospitalWardOptions,
}: PreAuthorizationPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const formModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || formModalOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [editState, setEditState] = useState<EditState | null>(null);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return preAuthorizations;

    return preAuthorizations.filter((row) =>
      [
        row.code,
        row.memberNo,
        row.provider,
        row.providerName,
        row.reportedBy,
        row.authorizedBy,
        row.preDiagnosis,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [preAuthorizations, searchQuery]);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeFormModal = useCallback(() => {
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
    closeFormModal();
    router.refresh();
  }, [closeFormModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editId) return;

    let cancelled = false;

    fetch(`/api/medical/care/pre-authorization/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load pre-authorization");
        }
        return res.json();
      })
      .then((row) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          form: preAuthorizationToFormValues(row),
          label: `Code ${row.code} · ${row.memberNo}`,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          form: null,
          label: "",
          error:
            error instanceof Error
              ? error.message
              : "Failed to load pre-authorization",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editForm = editState?.id === editId ? editState.form : null;
  const editLabel = editState?.id === editId ? editState.label : "";
  const editError = editState?.id === editId ? editState.error : "";
  const editingRow = editId
    ? preAuthorizations.find((row) => row.id === editId)
    : undefined;

  const compactThClass =
    "whitespace-nowrap px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass =
    "whitespace-nowrap px-2.5 py-1.5 text-[12px] text-slate-600";
  const compactEmptyCellClass =
    "px-2.5 py-4 text-center text-[12px] text-slate-500";

  const rowsTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Code</th>
            <th className={compactThClass}>Member No</th>
            <th className={compactThClass}>Provider</th>
            <th className={compactThClass}>Date Reported</th>
            <th className={compactThClass}>Pre Diagnosis</th>
            <th className={compactThClass}>Validity</th>
            <th className={compactThClass}>Authorized By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={7} className={compactEmptyCellClass}>
                {preAuthorizations.length === 0 ? (
                  <>
                    No pre-authorizations found.{" "}
                    <button
                      type="button"
                      onClick={openNewModal}
                      className="text-maroon hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  "No pre-authorizations match your search."
                )}
              </td>
            </tr>
          ) : (
            filteredRows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(row.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {row.code}
                  </button>
                </td>
                <td className={compactTdClass}>{row.memberNo}</td>
                <td className={compactTdClass}>
                  {row.providerName
                    ? `${row.providerName} (${row.provider})`
                    : row.provider}
                </td>
                <td className={compactTdClass}>
                  {row.dateReported ? formatDate(row.dateReported) : "—"}
                </td>
                <td className={compactTdClass}>{row.preDiagnosis ?? "—"}</td>
                <td className={compactTdClass}>
                  {row.validityDate ? formatDate(row.validityDate) : "—"}
                </td>
                <td className={compactTdClass}>{row.authorizedBy ?? "—"}</td>
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
          title="Pre-authorization"
          description="Open Pre-authorization from Care to view and manage authorizations"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Pre-authorization"
        description="Manage care pre-authorizations"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search pre-authorizations"
              className="w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Pre-authorization
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{rowsTable}</div>
        </div>
      </Modal>

      <Modal
        open={formModalOpen}
        onClose={closeFormModal}
        title={isNew ? "New Pre-authorization" : "Edit Pre-authorization"}
        description={
          isNew
            ? "Create a new care pre-authorization"
            : editLabel ||
              (editingRow
                ? `Code ${editingRow.code} · ${editingRow.memberNo}`
                : "Update pre-authorization details")
        }
        size="xl"
      >
        {isNew ? (
          <PreAuthorizationForm
            embedded
            providerOptions={providerOptions}
            hospitalWardOptions={hospitalWardOptions}
            onSuccess={handleSaved}
            onCancel={closeFormModal}
          />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading pre-authorization...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editForm && editId ? (
          <PreAuthorizationForm
            key={editId}
            embedded
            preAuthorizationId={editId}
            initial={editForm}
            providerOptions={providerOptions}
            hospitalWardOptions={hospitalWardOptions}
            onSuccess={handleSaved}
            onCancel={closeFormModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
