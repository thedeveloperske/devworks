"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      // Full navigation so middleware and cookies are re-evaluated cleanly.
      window.location.assign("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-maroon disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" />
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
