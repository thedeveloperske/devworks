"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import { formCardClass } from "@/lib/form-styles";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/applications");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8">
        <Image
          src="/logo-amanaha.png"
          alt="Amanah Insurance"
          width={280}
          height={84}
          className="h-16 w-auto sm:h-20"
          priority
        />
      </div>

      <form onSubmit={handleSubmit} className={`${formCardClass} w-full max-w-md`}>
        <h1 className="mb-1 text-[12px] font-bold text-maroon">Sign in</h1>
        <p className="mb-6 text-[12px] text-slate-500">
          Access Promed applications for Medical, Aviation, and General insurance.
        </p>

        <FormError message={error} className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700" />

        <div className="space-y-4">
          <FormField
            id="email"
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
