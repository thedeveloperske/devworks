export function formatCurrency(value: string | number | { toString(): string }) {
  const num = typeof value === "number" ? value : parseFloat(value.toString());
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(num);
}

/** Formats a numeric string with thousand separators (e.g. 1200000 → 1,200,000). */
export function formatThousands(value: string | number | null | undefined) {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  const negative = raw.startsWith("-");
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const [intPartRaw = "", ...fracParts] = cleaned.split(".");
  const intPart = intPartRaw.replace(/^0+(?=\d)/, "") || (fracParts.length ? "0" : intPartRaw);
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const hasDecimalPoint = raw.includes(".") || cleaned.includes(".");
  const frac = fracParts.join("").replace(/\D/g, "");

  const result =
    hasDecimalPoint && fracParts.length > 0
      ? `${formattedInt}.${frac}`
      : hasDecimalPoint && raw.endsWith(".")
        ? `${formattedInt}.`
        : formattedInt;

  return negative ? `-${result}` : result;
}

/** Removes thousand separators so values can be parsed as numbers. */
export function stripThousands(value: string | null | undefined) {
  return value?.replace(/,/g, "").trim() ?? "";
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
