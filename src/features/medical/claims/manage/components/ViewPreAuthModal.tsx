"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/admin/Modal";
import {
  preAuthorizationToFormValues,
  type PreAuthorizationFormData,
  type PreAuthorizationMemberBenefitOption,
  type PreAuthorizationMemberCoverPeriod,
} from "@/features/medical/care/pre-authorization";
import { PreAuthorizationForm } from "@/features/medical/care/pre-authorization/components/PreAuthorizationForm";
import type { LookupOption } from "@/features/medical/lookups/types";

type ViewPreAuthModalProps = {
  open: boolean;
  code: string | null;
  onClose: () => void;
  providerOptions: LookupOption[];
  hospitalWardOptions?: LookupOption[];
  memberBenefits?: PreAuthorizationMemberBenefitOption[];
  coverPeriods?: PreAuthorizationMemberCoverPeriod[];
};

export function ViewPreAuthModal({
  open,
  code,
  onClose,
  providerOptions,
  hospitalWardOptions = [],
  memberBenefits = [],
  coverPeriods = [],
}: ViewPreAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PreAuthorizationFormData | null>(null);

  useEffect(() => {
    if (!open || !code) {
      setLoading(false);
      setError("");
      setForm(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setForm(null);

    void (async () => {
      try {
        const res = await fetch(
          `/api/medical/care/pre-authorization/${encodeURIComponent(code)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(
            typeof data.error === "string"
              ? data.error
              : "Failed to load pre-authorization"
          );
          setLoading(false);
          return;
        }
        setForm(preAuthorizationToFormValues(data));
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError("Failed to load pre-authorization");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="View Preauthorization"
      description={code ? `Preauth Ref #${code}` : undefined}
      variant="popup"
      size="xl"
    >
      {loading ? (
        <p className="text-[11px] text-slate-500">Loading pre-authorization...</p>
      ) : error ? (
        <p className="text-[11px] text-red-600">{error}</p>
      ) : form ? (
        <PreAuthorizationForm
          key={`view-${code}`}
          embedded
          readOnly
          initial={form}
          providerOptions={providerOptions}
          hospitalWardOptions={hospitalWardOptions}
          memberBenefits={memberBenefits}
          coverPeriods={coverPeriods}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}
