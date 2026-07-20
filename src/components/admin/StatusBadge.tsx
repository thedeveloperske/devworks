const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${
        statusStyles[status] ?? statusStyles.INACTIVE
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </span>
  );
}
