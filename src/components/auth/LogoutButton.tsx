"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-maroon"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
