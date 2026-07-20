"use client";

import { Button } from "@/components/admin/Button";
import type { ClaimsBatchListItem } from "@/features/medical/claims/batching";
import { formatDate } from "@/lib/format";

type ViewBatchDetailsProps = {
  batch: ClaimsBatchListItem;
  onClose: () => void;
};

const sectionTitleClass =
  "border-b border-slate-200 pb-1 text-[12px] font-bold uppercase tracking-wide text-slate-700";
const fieldLabelClass = "text-[11px] font-medium uppercase tracking-wide text-slate-500";
const fieldValueClass = "text-[12px] text-slate-900";

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={fieldLabelClass}>{label}</dt>
      <dd className={fieldValueClass}>{value}</dd>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function ViewBatchDetails({ batch, onClose }: ViewBatchDetailsProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <section className="space-y-3">
          <h3 className={sectionTitleClass}>Batch details</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Batch No" value={displayValue(batch.batchNo)} />
            <DetailField label="Batch Date" value={formatDate(batch.batchDate)} />
            <DetailField label="Provider" value={displayValue(batch.providerName)} />
            <DetailField label="Date Received" value={formatDate(batch.dateReceived)} />
            <DetailField label="Claims Count" value={displayValue(batch.claimsCount)} />
            <DetailField label="Batch User" value={displayValue(batch.batchUser)} />
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className={sectionTitleClass}>Entrant assignment</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Entrant" value={displayValue(batch.dataEntryUser)} />
            <DetailField label="Assignment Date" value={formatDate(batch.dateEntryDate)} />
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className={sectionTitleClass}>Vetter assignment</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Vetter" value={displayValue(batch.vettingUser)} />
            <DetailField label="Assignment Date" value={formatDate(batch.vettingUserDate)} />
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className={sectionTitleClass}>Authorizer assignment</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Authorizer" value={displayValue(batch.authorisingUser)} />
            <DetailField label="Assignment Date" value={formatDate(batch.authorisingUserDate)} />
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className={sectionTitleClass}>Finance assignment</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Finance User" value={displayValue(batch.financeUser)} />
            <DetailField label="Assignment Date" value={formatDate(batch.financeUserDate)} />
          </dl>
        </section>
      </div>

      <div className="mt-3 flex shrink-0 justify-end border-t border-slate-200 pt-3">
        <Button type="button" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
