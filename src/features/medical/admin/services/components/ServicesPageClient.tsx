"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ServiceForm } from "./ServiceForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  serviceToFormValues,
  type ServiceFormData,
  type ServiceListItem,
} from "@/features/medical/admin/services";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type ServicesPageClientProps = {
  services: ServiceListItem[];
};

type EditServiceState = {
  id: string;
  service: ServiceFormData | null;
  name: string;
  error: string;
};

export function ServicesPageClient({ services }: ServicesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const serviceModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || serviceModalOpen;

  const [editState, setEditState] = useState<EditServiceState | null>(null);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical/selection-items?manage=1");
  }, [router]);

  const closeServiceModal = useCallback(() => {
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
    closeServiceModal();
    router.refresh();
  }, [closeServiceModal, router]);

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

    fetch(`/api/medical/services/${encodeURIComponent(editId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load service");
        }
        return res.json();
      })
      .then((row) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          service: serviceToFormValues(row),
          name: row.service,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          service: null,
          name: "",
          error:
            error instanceof Error ? error.message : "Failed to load service",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editService = editState?.id === editId ? editState.service : null;
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingService = editId
    ? services.find((row) => row.id === editId)
    : undefined;

  const compactThClass =
    "px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass = "px-2.5 py-1.5 text-[11px] text-slate-600";
  const compactEmptyCellClass =
    "px-2.5 py-4 text-center text-[11px] text-slate-500";

  const servicesTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Code</th>
            <th className={compactThClass}>Service</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {services.length === 0 ? (
            <tr>
              <td colSpan={2} className={compactEmptyCellClass}>
                No services found.{" "}
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
            services.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>{row.code}</td>
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(row.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {row.service}
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
          title="Service"
          description="Open Service from Selection Items to view and edit claim services"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Service"
        description="Manage claim services"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 justify-end">
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Service
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{servicesTable}</div>
        </div>
      </Modal>

      <Modal
        open={serviceModalOpen}
        onClose={closeServiceModal}
        title={isNew ? "New Service" : "Edit Service"}
        description={
          isNew
            ? "Register a new claim service"
            : editName || editingService?.service || "Update service details"
        }
      >
        {isNew ? (
          <ServiceForm
            embedded
            onSuccess={handleSaved}
            onCancel={closeServiceModal}
          />
        ) : editLoading ? (
          <p className="text-[11px] text-slate-500">Loading service...</p>
        ) : editError ? (
          <p className="text-[11px] text-red-600">{editError}</p>
        ) : editService && editId ? (
          <ServiceForm
            key={editId}
            embedded
            serviceId={editId}
            initial={editService}
            onSuccess={handleSaved}
            onCancel={closeServiceModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
