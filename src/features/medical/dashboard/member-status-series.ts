export type MemberStatusPoint = {
  /** Month key YYYY-MM */
  month: string;
  /** Short label e.g. Jan 26 */
  label: string;
  active: number;
  cancelled: number;
};

type CancellationEvent = {
  cancelled: number;
  dateCan: Date;
};

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  return date.toLocaleString("en-GB", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function clampNonNegative(value: number) {
  return value < 0 ? 0 : value;
}

/**
 * Builds end-of-month snapshots of active vs cancelled member counts for the
 * last `monthCount` months. Starts from current member_info totals and walks
 * member_cancellation events backward so earlier months reconstruct prior state.
 */
export function buildMemberStatusSeries(params: {
  activeCount: number;
  cancelledCount: number;
  events: CancellationEvent[];
  monthCount?: number;
  asOf?: Date;
}): MemberStatusPoint[] {
  const monthCount = params.monthCount ?? 12;
  const asOf = params.asOf ?? new Date();
  const asOfUtc = new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate())
  );

  const months: { key: string; year: number; monthIndex: number }[] = [];
  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const cursor = new Date(
      Date.UTC(asOfUtc.getUTCFullYear(), asOfUtc.getUTCMonth() - i, 1)
    );
    months.push({
      key: monthKey(cursor),
      year: cursor.getUTCFullYear(),
      monthIndex: cursor.getUTCMonth(),
    });
  }

  const eventsByMonth = new Map<string, CancellationEvent[]>();
  for (const event of params.events) {
    const key = monthKey(event.dateCan);
    const bucket = eventsByMonth.get(key);
    if (bucket) bucket.push(event);
    else eventsByMonth.set(key, [event]);
  }

  let active = params.activeCount;
  let cancelled = params.cancelledCount;
  const pointsDesc: MemberStatusPoint[] = [];

  // Walk newest → oldest; record end-of-month state, then undo that month's events.
  for (let i = months.length - 1; i >= 0; i -= 1) {
    const month = months[i]!;
    pointsDesc.push({
      month: month.key,
      label: monthLabel(month.year, month.monthIndex),
      active: clampNonNegative(active),
      cancelled: clampNonNegative(cancelled),
    });

    const monthEvents = eventsByMonth.get(month.key) ?? [];
    for (const event of monthEvents) {
      if (event.cancelled === 1) {
        // Undo a cancellation → member was active before this month's event.
        cancelled -= 1;
        active += 1;
      } else {
        // Undo a reinstatement → member was cancelled before this month's event.
        active -= 1;
        cancelled += 1;
      }
    }

    active = clampNonNegative(active);
    cancelled = clampNonNegative(cancelled);
  }

  return pointsDesc.reverse();
}
