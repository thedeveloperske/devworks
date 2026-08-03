"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const menuWidth = 160;
const menuHeight = 72;
const menuButtonClass =
  "flex h-7 w-7 items-center justify-center text-slate-500 hover:text-maroon";
const menuPanelClass =
  "fixed z-[70] min-w-[10rem] border border-slate-200 bg-white py-1 shadow-lg";
const menuItemClass =
  "block w-full px-3 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-50";

function getMenuPosition(button: HTMLButtonElement) {
  const rect = button.getBoundingClientRect();
  const viewportPadding = 8;

  let top = rect.bottom + 4;
  let left = rect.right - menuWidth;

  if (top + menuHeight > window.innerHeight - viewportPadding) {
    top = rect.top - menuHeight - 4;
  }

  left = Math.max(
    viewportPadding,
    Math.min(left, window.innerWidth - menuWidth - viewportPadding)
  );
  top = Math.max(
    viewportPadding,
    Math.min(top, window.innerHeight - menuHeight - viewportPadding)
  );

  return { top, left };
}

function PreAuthRowActions({
  code,
  isAttached,
  onAttach,
  onDetach,
}: {
  code: string;
  isAttached: boolean;
  onAttach: (code: string) => void;
  onDetach: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      setPosition(getMenuPosition(buttonRef.current));
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  const menu = open ? (
    <div
      ref={menuRef}
      role="menu"
      className={menuPanelClass}
      style={{ top: position.top, left: position.left }}
    >
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() =>
          runAction(() => {
            if (isAttached) onDetach();
            else onAttach(code);
          })
        }
      >
        {isAttached ? "Detach" : "Attach"}
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() =>
          runAction(() => {
            window.open(
              `/admin/medical/care/pre-authorization?manage=1&view=${encodeURIComponent(code)}`,
              "_blank",
              "noopener,noreferrer"
            );
          })
        }
      >
        View Preauth
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for preauth ${code}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={menuButtonClass}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {mounted && menu ? createPortal(menu, document.body) : null}
    </>
  );
}

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
        <div className="min-h-0 flex-1 overflow-auto border border-slate-200">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className={thClass}>Preauth No</th>
                <th className={thClass}>Authorized</th>
                <th className={thClass}>Validity</th>
                <th className={`${thClass} text-right`}>Reserve</th>
                <th className={thClass}>Diagnosis</th>
                <th className={thClass}>Actions</th>
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
                        <PreAuthRowActions
                          code={row.code}
                          isAttached={isAttached}
                          onAttach={onAttach}
                          onDetach={onDetach}
                        />
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
