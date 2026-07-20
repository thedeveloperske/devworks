"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ClaimsBatchListItem } from "@/features/medical/claims/batching";
import type { BatchManageTab } from "@/features/medical/claims/batching/batch-manage-types";
import { canAssignAuthorizer, canAssignVetter } from "@/features/medical/claims/batching/batch-workflow";

type BatchActionsMenuProps = {
  batch: ClaimsBatchListItem;
  onManage: (id: string, tab: BatchManageTab) => void;
  onView: (id: string) => void;
};

const menuWidth = 176;
const menuItemCount = 5;
const menuItemHeight = 30;
const menuPadding = 8;
const menuHeight = menuItemCount * menuItemHeight + menuPadding;

const menuButtonClass =
  "flex h-7 w-7 items-center justify-center text-slate-500 hover:text-maroon";
const menuPanelClass =
  "fixed z-50 min-w-[11rem] border border-slate-200 bg-white py-1 shadow-lg";
const menuItemClass =
  "block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50";
const menuItemDisabledClass =
  "block w-full cursor-not-allowed px-3 py-1.5 text-left text-[12px] text-slate-400";

function getMenuPosition(button: HTMLButtonElement) {
  const rect = button.getBoundingClientRect();
  const viewportPadding = 8;

  let top = rect.bottom + 4;
  let left = rect.right - menuWidth;

  if (top + menuHeight > window.innerHeight - viewportPadding) {
    top = rect.top - menuHeight - 4;
  }

  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding));
  top = Math.max(viewportPadding, Math.min(top, window.innerHeight - menuHeight - viewportPadding));

  return { top, left };
}

export function BatchActionsMenu({ batch, onManage, onView }: BatchActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const entrantAssigned = canAssignVetter(batch);
  const vetterAssigned = canAssignAuthorizer(batch);

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
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
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
        onClick={() => runAction(() => onManage(batch.id, "edit"))}
      >
        Edit batch
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => runAction(() => onManage(batch.id, "entrant"))}
      >
        {batch.dataEntryUser ? "Reassign entrant" : "Assign entrant"}
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!entrantAssigned}
        title={entrantAssigned ? undefined : "Assign an entrant before assigning a vetter"}
        className={entrantAssigned ? menuItemClass : menuItemDisabledClass}
        onClick={() => {
          if (!entrantAssigned) return;
          runAction(() => onManage(batch.id, "vetter"));
        }}
      >
        {batch.vettingUser ? "Reassign vetter" : "Assign vetter"}
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!vetterAssigned}
        title={vetterAssigned ? undefined : "Assign a vetter before assigning an authorizer"}
        className={vetterAssigned ? menuItemClass : menuItemDisabledClass}
        onClick={() => {
          if (!vetterAssigned) return;
          runAction(() => onManage(batch.id, "authorizer"));
        }}
      >
        {batch.authorisingUser ? "Reassign authorizer" : "Assign authorizer"}
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => runAction(() => onView(batch.id))}
      >
        View batch
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for batch ${batch.batchNo ?? batch.id}`}
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
