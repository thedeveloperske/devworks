import {
  MEMBER_CANCEL_REASONS,
  MEMBER_REINSTATE_REASONS,
} from "@/features/medical/lookups";
import type { MemberCancellationHistoryRow } from "./member-cancellation-types";

function formatDateValue(value: Date | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString().slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

function reasonLabel(cancelled: number, reason: number | null | undefined) {
  if (reason == null) return "";
  const key = String(reason);
  const reasons =
    cancelled === 1 ? MEMBER_CANCEL_REASONS : MEMBER_REINSTATE_REASONS;
  return reasons.find((item) => item.key === key)?.value ?? key;
}

export function memberCancellationToHistoryRow(row: {
  idx: number;
  memberNo: string;
  cancelled: number;
  dateCan: Date;
  anniv: number | null;
  reason: number | null;
  userId: string | null;
  dateEntered: Date | null;
}): MemberCancellationHistoryRow {
  const isCancelled = row.cancelled === 1;
  return {
    id: String(row.idx),
    memberNo: row.memberNo,
    action: isCancelled ? "Cancelled" : "Reinstated",
    dateCan: formatDateValue(row.dateCan),
    anniv: row.anniv != null ? String(row.anniv) : "",
    reason: reasonLabel(row.cancelled, row.reason),
    userId: row.userId?.trim() ?? "",
    dateEntered: formatDateValue(row.dateEntered),
  };
}
