"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";

type UserAvatarMenuProps = {
  name: string;
  email?: string;
};

type DialogKind = "profile" | "change-password" | null;

const menuWidth = 200;
const menuItemCount = 4;
const menuItemHeight = 32;
const menuPadding = 8;
const menuHeaderHeight = 48;
const menuHeight =
  menuHeaderHeight + menuItemCount * menuItemHeight + menuPadding;

const menuPanelClass =
  "fixed z-[120] min-w-[12.5rem] border border-slate-200 bg-white py-1 shadow-lg";
const menuItemClass =
  "block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50";
const menuItemDangerClass =
  "block w-full px-3 py-1.5 text-left text-[12px] text-red-700 hover:bg-red-50";
const fieldLabelClass = "text-[12px] font-medium text-slate-500";
const fieldValueClass = "mt-0.5 text-[12px] font-semibold text-slate-900";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

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

export function UserAvatarMenu({ name, email }: UserAvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = name.trim() || email?.trim() || "User";
  const username = email?.trim() || "—";
  const initials = getInitials(displayName);

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

  const openDialog = (kind: Exclude<DialogKind, null>) => {
    setOpen(false);
    setDialog(kind);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setOpen(false);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      window.location.assign("/login");
    }
  };

  const menu = open ? (
    <div
      ref={menuRef}
      role="menu"
      className={menuPanelClass}
      style={{ top: position.top, left: position.left, width: menuWidth }}
    >
      <div className="border-b border-slate-200 px-3 py-2">
        <p className="truncate text-[12px] font-semibold text-slate-900">
          {displayName}
        </p>
        {email ? (
          <p className="truncate text-[11px] text-slate-500">{email}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => openDialog("profile")}
      >
        Profile
      </button>
      <Link
        href="/applications"
        role="menuitem"
        className={menuItemClass}
        onClick={() => setOpen(false)}
      >
        Applications
      </Link>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => openDialog("change-password")}
      >
        Change Password
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemDangerClass}
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="relative z-[110] inline-flex max-w-full shrink-0 items-center gap-2 border border-slate-200 bg-white px-1.5 py-1 hover:border-maroon/40"
      >
        <span
          aria-hidden
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon text-[11px] font-bold text-white"
        >
          {initials}
        </span>
        <span className="hidden min-w-0 max-w-[9rem] truncate text-[12px] font-semibold text-slate-700 sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {mounted && menu ? createPortal(menu, document.body) : null}

      <Modal
        open={dialog === "profile"}
        onClose={() => setDialog(null)}
        title="Profile"
        description="Your account details"
        variant="popup"
        size="md"
      >
        <div className="space-y-3">
          <div>
            <p className={fieldLabelClass}>Name</p>
            <p className={fieldValueClass}>{displayName}</p>
          </div>
          <div>
            <p className={fieldLabelClass}>Username</p>
            <p className={fieldValueClass}>{username}</p>
          </div>
          <p className="text-[12px] text-slate-500">
            Profile editing will be added in a later update.
          </p>
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDialog(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={dialog === "change-password"}
        onClose={() => setDialog(null)}
        title="Change Password"
        description="Update your sign-in password"
        variant="popup"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-[12px] text-slate-600">
            Password change will be available in a later update.
          </p>
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDialog(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
