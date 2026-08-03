"use client";

import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import type { ManageClaimsPreAuthOption } from "@/features/medical/claims/manage/types";

type AttachPreAuthModalProps = {
  open: boolean;
  onClose: () => void;
  matches: ManageClaimsPreAuthOption[];
  attachedCode: string;
  onAttach: (code: string) => void;
  onDetach: () => void;
  claimNatureLabel?: string;
};

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[11px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[11px] text-slate-500";

export function AttachPreAuthModal({
  open,
  onClose,
  matches,
  attachedCode,
  onAttach,
  onDetach,
  claimNatureLabel,
}: AttachPreAuthModalProps) {
  const attached = attachedCode.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attach Preauthorization"
      description={
        claimNatureLabel
          ? `Matching preauths for claim nature: ${claimNatureLabel}`
          : "Matching preauths for this member, provider, anniversary, and claim nature"
      }
      variant="popup"
      size="xl"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border border-slate-200 bg-slate-50 px-2.5 py-1.5">
          <p className="text-[11px] text-slate-600">
            Attached:{" "}
            <span className="font-semibold text-slate-900">
              {attached || "None"}
            </span>
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!attached}
            onClick={onDetach}
          >
            Detach
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto border border-slate-200">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className={thClass}>Preauth No</th>
                <th className={thClass}>Authorized</th>
                <th className={thClass}>Validity</th>
                <th className={`${thClass} text-right`}>Reserve</th>
                <th className={thClass}>Diagnosis</th>
                <th className={thClass}>Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={6} className={emptyCellClass}>
                    No matching preauthorizations found.
                  </td>
                </tr>
              ) : (
                matches.map((row) => {
                  const isAttached = attached === row.code;
                  return (
                    <tr
                      key={row.code}
                      className={`bg-white hover:bg-slate-50 ${
                        isAttached ? "bg-maroon/5" : ""
                      }`}
                    >
                      <td className={`${tdClass} font-semibold text-slate-900`}>
                        {row.code}
                      </td>
                      <td className={tdClass}>{row.dateAuthorized || "—"}</td>
                      <td className={tdClass}>{row.validityDate || "—"}</td>
                      <td className={`${tdClass} text-right`}>
                        {row.reserve || "—"}
                      </td>
                      <td className={tdClass}>{row.preDiagnosis || "—"}</td>
                      <td className={tdClass}>
                        {isAttached ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onDetach}
                          >
                            Detach
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onAttach(row.code)}
                          >
                            Attach
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
