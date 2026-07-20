import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen overflow-hidden bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}
