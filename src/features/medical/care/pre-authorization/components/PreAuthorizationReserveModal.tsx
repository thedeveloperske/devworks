"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import { Modal } from "@/components/admin/Modal";
import type { PreAuthorizationListItem } from "@/features/medical/care/pre-authorization";
import { formatThousands, stripThousands } from "@/lib/format";

type ReserveAdjustMode = "top-up" | "release";

type PreAuthorizationReserveModalProps = {
  open: boolean;
  mode: ReserveAdjustMode;
  row: PreAuthorizationListItem | null;
  subjectName?: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function PreAuthorizationReserveModal({
  open,
  mode,
  row,
  subjectName,
  onClose,
  onSuccess,
}: PreAuthorizationReserveModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isTopUp = mode === "top-up";
  const title = isTopUp ? "Top Up Reserve" : "Release Reserve";
  const resolvedSubject =
    subjectName?.trim() || row?.memberName?.trim() || null;
  const description = row
    ? resolvedSubject
      ? `Preauth Number #${row.code} for ${resolvedSubject}`
      : `Preauth Number #${row.code}`
    : undefined;
  const currentReserve = row?.reserve ?? "0";

  const handleClose = () => {
    setAmount("");
    setError("");
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return;

    const raw = stripThousands(amount);
    const parsed = Number.parseFloat(raw);
    if (!raw || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount greater than zero");
      return;
    }

    const current = Number.parseFloat(stripThousands(currentReserve) || "0");
    if (!isTopUp && parsed > current) {
      setError("Release amount cannot exceed the current reserve");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch(
      `/api/medical/care/pre-authorization/${row.id}/reserve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isTopUp ? "top-up" : "release",
          amount: raw,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setAmount("");
    setLoading(false);
    onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      variant="popup"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <FormField
          id="current-reserve"
          name="currentReserve"
          label="Current Reserve"
          value={currentReserve || "0"}
          onChange={() => undefined}
          disabled
          inputClassName="w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-right text-[12px] text-slate-600"
        />
        <FormField
          id="reserve-amount"
          name="amount"
          label={isTopUp ? "Top Up Amount *" : "Release Amount *"}
          value={amount}
          onChange={(e) => setAmount(formatThousands(e.target.value))}
          required
          inputClassName="w-full border border-slate-300 bg-white px-2 py-1.5 text-right text-[12px] text-slate-900 focus:border-maroon focus:outline-none"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading || !row}
            className="w-full sm:w-auto"
          >
            {loading ? "Saving..." : isTopUp ? "Top Up" : "Release"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
