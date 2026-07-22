"use client";

import { useEffect, useState } from "react";
import type { LookupOption } from "@/features/medical/lookups/types";
import type { ClaimsBatchFormData } from "@/features/medical/claims/batching";
import { ClaimsBatchForm } from "./ClaimsBatchForm";

type EditBatchModalContentProps = {
  batchId: string;
  providers: LookupOption[];
  currentUserName: string;
  onClose: () => void;
  onUpdated: (message: string) => void;
};

export function EditBatchModalContent({
  batchId,
  providers,
  currentUserName,
  onClose,
  onUpdated,
}: EditBatchModalContentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState<ClaimsBatchFormData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/medical/claims/batches/${batchId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load batch");
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setEditForm(data.form);
        setLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setEditForm(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load batch"
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  if (loading) {
    return <p className="text-[12px] text-slate-500">Loading batch...</p>;
  }

  if (error) {
    return <p className="text-[12px] text-red-600">{error}</p>;
  }

  if (!editForm) {
    return null;
  }

  return (
    <ClaimsBatchForm
      key={batchId}
      embedded
      batchId={batchId}
      initial={editForm}
      providers={providers}
      currentUserName={currentUserName}
      onSuccess={() => {
        onUpdated("Batch updated.");
        onClose();
      }}
      onCancel={onClose}
    />
  );
}
