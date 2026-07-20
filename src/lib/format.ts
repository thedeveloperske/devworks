export function formatCurrency(value: string | number | { toString(): string }) {
  const num = typeof value === "number" ? value : parseFloat(value.toString());
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function memberLabel(member: {
  firstName: string;
  lastName: string;
  memberNumber: string;
}) {
  return `${member.firstName} ${member.lastName} (${member.memberNumber})`;
}
