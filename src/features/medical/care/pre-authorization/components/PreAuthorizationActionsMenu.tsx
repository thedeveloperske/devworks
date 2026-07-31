"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PreAuthorizationListItem } from "@/features/medical/care/pre-authorization";

export type PreAuthorizationAction =
  | "view"
  | "print"
  | "top-up"
  | "release";

type PreAuthorizationActionsMenuProps = {
  row: PreAuthorizationListItem;
  onAction: (action: PreAuthorizationAction, row: PreAuthorizationListItem) => void;
};

const menuWidth = 176;
const menuItemCount = 4;
const menuItemHeight = 30;
const menuPadding = 8;
const menuHeight = menuItemCount * menuItemHeight + menuPadding;

const menuButtonClass =
  "flex h-7 w-7 items-center justify-center text-slate-500 hover:text-maroon";
const menuPanelClass =
  "fixed z-50 min-w-[11rem] border border-slate-200 bg-white py-1 shadow-lg";
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

export function PreAuthorizationActionsMenu({
  row,
  onAction,
}: PreAuthorizationActionsMenuProps) {
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

  const runAction = (action: PreAuthorizationAction) => {
    setOpen(false);
    onAction(action, row);
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
        onClick={() => runAction("view")}
      >
        View Preauth
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => runAction("print")}
      >
        Print
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => runAction("top-up")}
      >
        Top Up
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => runAction("release")}
      >
        Release
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for pre-authorization ${row.code}`}
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
