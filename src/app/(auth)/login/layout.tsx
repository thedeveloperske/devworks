export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 overflow-hidden bg-slate-50">{children}</div>;
}
