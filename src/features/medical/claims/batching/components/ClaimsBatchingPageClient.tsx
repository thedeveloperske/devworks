"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import type { LookupOption } from "@/features/medical/lookups/types";
import type { ClaimsBatchListItem } from "@/features/medical/claims/batching";
import type { BatchManageTab } from "@/features/medical/claims/batching/batch-manage-types";
import { BatchActionsMenu } from "./BatchActionsMenu";
import { BatchManageModal } from "./BatchManageModal";
import { ClaimsBatchForm } from "./ClaimsBatchForm";
import { ViewBatchDetails } from "./ViewBatchDetails";
import { formatDate } from "@/lib/format";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type ClaimsBatchingPageClientProps = {
  batches: ClaimsBatchListItem[];
  providers: LookupOption[];
  currentUserName: string;
};

const compactThClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
const compactTdClass =
  "whitespace-nowrap border-b border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2.5 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-44 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

const manageTabs: BatchManageTab[] = ["edit", "entrant", "vetter", "authorizer"];

function parseManageTab(value: string | null): BatchManageTab {
  if (value && manageTabs.includes(value as BatchManageTab)) {
    return value as BatchManageTab;
  }
  return "edit";
}

export function ClaimsBatchingPageClient({
  batches,
  providers,
  currentUserName,
}: ClaimsBatchingPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const batchId = searchParams.get("batch");
  const batchTab = parseManageTab(searchParams.get("tab"));
  const viewId = searchParams.get("view");
  const manageOpen = searchParams.get("manage") === "1";
  const newBatchModalOpen = isNew;
  const manageBatchModalOpen = Boolean(batchId);
  const viewModalOpen = Boolean(viewId);
  const modalOpen = manageOpen || newBatchModalOpen || manageBatchModalOpen || viewModalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeNewBatchModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const closeManageBatchModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("batch");
    params.delete("tab");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const closeViewModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const openNewModal = useCallback(() => {
    router.push(`${pathname}?manage=1&new=1`, { scroll: false });
  }, [pathname, router]);

  const openManageModal = useCallback(
    (id: string, tab: BatchManageTab) => {
      setActionNotice("");
      router.push(`${pathname}?manage=1&batch=${id}&tab=${tab}`, { scroll: false });
    },
    [pathname, router]
  );

  const openViewModal = useCallback(
    (id: string) => {
      setActionNotice("");
      router.push(`${pathname}?manage=1&view=${id}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleManageTabChange = useCallback(
    (tab: BatchManageTab) => {
      if (!batchId) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("manage", "1");
      params.set("batch", batchId);
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [batchId, pathname, router, searchParams]
  );

  const handleNewBatchSaved = useCallback(() => {
    closeNewBatchModal();
    router.refresh();
  }, [closeNewBatchModal, router]);

  const handleBatchUpdated = useCallback(
    (message: string) => {
      setActionNotice(message);
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  const filteredBatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return batches;
    return batches.filter((batch) => {
      const haystack = [
        batch.batchNo,
        batch.providerName,
        batch.batchUser,
        batch.providerCode,
        batch.dataEntryUser,
        batch.vettingUser,
        batch.authorisingUser,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [batches, searchQuery]);

  const manageBatch = batchId ? batches.find((batch) => batch.id === batchId) : undefined;
  const viewBatch = viewId ? batches.find((batch) => batch.id === viewId) : undefined;

  const batchesTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={`${tableHeadClass} sticky top-0 z-10`}>
          <tr>
            <th className={compactThClass}>Batch No</th>
            <th className={compactThClass}>Batch Date</th>
            <th className={compactThClass}>Provider</th>
            <th className={compactThClass}>Date Received</th>
            <th className={compactThClass}>Claims</th>
            <th className={`${compactThClass} w-10`} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {filteredBatches.length === 0 ? (
            <tr>
              <td colSpan={6} className={emptyCellClass}>
                {batches.length === 0 ? (
                  <>
                    No batches yet.{" "}
                    <button
                      type="button"
                      onClick={openNewModal}
                      className="text-maroon hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  "No batches match your search."
                )}
              </td>
            </tr>
          ) : (
            filteredBatches.map((batch) => (
              <tr key={batch.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>
                  <span className="font-semibold text-slate-900">
                    {batch.batchNo ?? `#${batch.id}`}
                  </span>
                </td>
                <td className={compactTdClass}>{formatDate(batch.batchDate)}</td>
                <td className={compactTdClass}>{batch.providerName ?? "—"}</td>
                <td className={compactTdClass}>{formatDate(batch.dateReceived)}</td>
                <td className={compactTdClass}>{batch.claimsCount ?? "0"}</td>
                <td className={compactTdClass}>
                  <BatchActionsMenu
                    batch={batch}
                    onManage={openManageModal}
                    onView={openViewModal}
                  />
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
          title="Batching"
          description="Capture and track claims batches through vetting and finance"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Claims Batching"
        description="Create batches and record workflow progress"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batches..."
              className={searchInputClass}
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              New Batch
            </Button>
          </div>
          {actionNotice ? (
            <p className="shrink-0 text-[12px] text-emerald-700">{actionNotice}</p>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto">{batchesTable}</div>
        </div>
      </Modal>

      <Modal
        open={newBatchModalOpen}
        onClose={closeNewBatchModal}
        variant="popup"
        size="lg"
        title="New Claims Batch"
        description="Capture a new batch of claims from a provider"
      >
        <ClaimsBatchForm
          embedded
          providers={providers}
          currentUserName={currentUserName}
          onSuccess={handleNewBatchSaved}
          onCancel={closeNewBatchModal}
        />
      </Modal>

      <Modal
        open={manageBatchModalOpen}
        onClose={closeManageBatchModal}
        variant="popup"
        size="xl"
        title="Manage Batch"
        description={
          manageBatch?.batchNo
            ? `Update ${manageBatch.batchNo} and workflow assignments`
            : "Update batch details and assignments"
        }
      >
        {batchId && manageBatch ? (
          <BatchManageModal
            key={batchId}
            batchId={batchId}
            tab={batchTab}
            batch={manageBatch}
            providers={providers}
            currentUserName={currentUserName}
            onTabChange={handleManageTabChange}
            onClose={closeManageBatchModal}
            onUpdated={handleBatchUpdated}
          />
        ) : batchId ? (
          <p className="text-[12px] text-red-600">Batch not found.</p>
        ) : null}
      </Modal>

      <Modal
        open={viewModalOpen}
        onClose={closeViewModal}
        variant="popup"
        size="lg"
        title="View Batch"
        description={
          viewBatch?.batchNo ? `Details for ${viewBatch.batchNo}` : "Batch details"
        }
      >
        {viewId && viewBatch ? (
          <ViewBatchDetails key={viewId} batch={viewBatch} onClose={closeViewModal} />
        ) : viewId ? (
          <p className="text-[12px] text-red-600">Batch not found.</p>
        ) : null}
      </Modal>
    </div>
  );
}
