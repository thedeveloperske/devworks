"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProviderForm } from "./ProviderForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  providerToFormValues,
  type ProviderFormData,
  type ProviderListItem,
} from "@/features/medical/admin/providers";
import { townOptions } from "@/features/medical/lookups";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type ProvidersPageClientProps = {
  providers: ProviderListItem[];
};

type EditProviderState = {
  id: string;
  provider: ProviderFormData | null;
  name: string;
  error: string;
};

export function ProvidersPageClient({ providers }: ProvidersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const providerModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || providerModalOpen;

  const [editState, setEditState] = useState<EditProviderState | null>(null);

  const townLabelById = useMemo(
    () => Object.fromEntries(townOptions.map((option) => [option.value, option.label])),
    []
  );

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeProviderModal = useCallback(() => {
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
    closeProviderModal();
    router.refresh();
  }, [closeProviderModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editId) {
      return;
    }

    let cancelled = false;

    fetch(`/api/medical/providers/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load provider");
        }
        return res.json();
      })
      .then((provider) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          provider: providerToFormValues(provider),
          name: provider.provider,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          provider: null,
          name: "",
          error: error instanceof Error ? error.message : "Failed to load provider",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editProvider = editState?.id === editId ? editState.provider : null;
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingProvider = editId
    ? providers.find((provider) => provider.id === editId)
    : undefined;

  const compactThClass =
    "px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass = "px-2.5 py-1.5 text-[12px] text-slate-600";
  const compactEmptyCellClass = "px-2.5 py-4 text-center text-[12px] text-slate-500";

  const providersTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Provider</th>
            <th className={compactThClass}>Mobile</th>
            <th className={compactThClass}>Email</th>
            <th className={compactThClass}>Town</th>
            <th className={compactThClass}>Contact Person</th>
            <th className={compactThClass}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {providers.length === 0 ? (
            <tr>
              <td colSpan={6} className={compactEmptyCellClass}>
                No providers found.{" "}
                <button type="button" onClick={openNewModal} className="text-maroon hover:underline">
                  Create one
                </button>
              </td>
            </tr>
          ) : (
            providers.map((provider) => (
              <tr key={provider.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(provider.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {provider.provider}
                  </button>
                </td>
                <td className={compactTdClass}>{provider.mobileNo ?? "—"}</td>
                <td className={compactTdClass}>{provider.email ?? "—"}</td>
                <td className={compactTdClass}>
                  {provider.town
                    ? (townLabelById[provider.town] ?? provider.town)
                    : "—"}
                </td>
                <td className={compactTdClass}>{provider.contactPerson ?? "—"}</td>
                <td className={compactTdClass}>{provider.status ?? "—"}</td>
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
          title="Providers"
          description="Open Provider List from the menu to view and edit healthcare providers"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Provider List"
        description="Manage healthcare providers and their contact details"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 justify-end">
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Provider
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{providersTable}</div>
        </div>
      </Modal>

      <Modal
        open={providerModalOpen}
        onClose={closeProviderModal}
        title={isNew ? "New Provider" : "Edit Provider"}
        description={
          isNew
            ? "Register a new healthcare provider"
            : editName || editingProvider?.provider || "Update provider details"
        }
      >
        {isNew ? (
          <ProviderForm embedded onSuccess={handleSaved} onCancel={closeProviderModal} />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading provider...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editProvider && editId ? (
          <ProviderForm
            key={editId}
            embedded
            providerId={editId}
            initial={editProvider}
            onSuccess={handleSaved}
            onCancel={closeProviderModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
