import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { CoverDateFormData, CoverDateInput, RenewalListItem } from "./types";

function parseDateField(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  return { date };
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function deriveCoverDatesFromStart(startDate?: string) {
  const trimmed = startDate?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { endDate: "", renewalDate: "" };
  }

  const start = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return { endDate: "", renewalDate: "" };
  }

  const end = new Date(start);
  end.setUTCFullYear(end.getUTCFullYear() + 1);

  const renewal = new Date(end);
  renewal.setUTCDate(renewal.getUTCDate() + 1);

  return {
    endDate: formatDateInput(end),
    renewalDate: formatDateInput(renewal),
  };
}

export function deriveRenewalDateFromEnd(endDate?: string) {
  const trimmed = endDate?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "";
  }

  const end = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(end.getTime())) {
    return "";
  }

  const renewal = new Date(end);
  renewal.setUTCDate(renewal.getUTCDate() + 1);
  return formatDateInput(renewal);
}

export function validateCoverDateOrder(coverDates?: {
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
}) {
  const start = coverDates?.startDate?.trim() ?? "";
  const end = coverDates?.endDate?.trim() ?? "";
  const renewal = coverDates?.renewalDate?.trim() ?? "";

  if (!start && !end && !renewal) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(renewal)
  ) {
    return null;
  }

  const startMs = Date.parse(`${start}T00:00:00.000Z`);
  const endMs = Date.parse(`${end}T00:00:00.000Z`);
  const renewalMs = Date.parse(`${renewal}T00:00:00.000Z`);

  if (
    Number.isNaN(startMs) ||
    Number.isNaN(endMs) ||
    Number.isNaN(renewalMs)
  ) {
    return null;
  }

  if (endMs < startMs) {
    return "End date cannot be before start date";
  }
  if (renewalMs < endMs) {
    return "Renewal date cannot be before end date";
  }
  if (renewalMs < startMs) {
    return "Renewal date cannot be before start date";
  }

  return null;
}

export function hasCoverDateInput(coverDates?: CoverDateInput) {
  if (!coverDates) return false;
  return Boolean(
    coverDates.startDate?.trim() ||
      coverDates.endDate?.trim() ||
      coverDates.renewalDate?.trim()
  );
}

export function buildCoverDateData(
  coverDates: CoverDateInput | undefined,
  corporate: {
    corpId: string | null;
    agentId: string | null;
    channel: string | null;
  }
) {
  if (!hasCoverDateInput(coverDates)) {
    return { data: null };
  }

  const corpId = corporate.corpId?.trim();
  if (!corpId) {
    return {
      error: NextResponse.json(
        { error: "Corporate corp ID is missing" },
        { status: 500 }
      ),
    };
  }

  const agentId = corporate.agentId?.trim();
  if (!agentId) {
    return {
      error: NextResponse.json(
        { error: "Intermediary is required to save cover dates" },
        { status: 400 }
      ),
    };
  }

  const channel = corporate.channel?.trim();
  if (!channel) {
    return {
      error: NextResponse.json(
        { error: "Channel is required to save cover dates" },
        { status: 400 }
      ),
    };
  }

  const smartSync = Number(channel);
  if (!Number.isInteger(smartSync)) {
    return {
      error: NextResponse.json({ error: "Invalid channel" }, { status: 400 }),
    };
  }

  const annivValue = coverDates?.anniv?.trim();
  if (!annivValue) {
    return {
      error: NextResponse.json({ error: "Anniv is required" }, { status: 400 }),
    };
  }
  const anniv = Number(annivValue);
  if (!Number.isInteger(anniv) || anniv < 0 || anniv > 99) {
    return {
      error: NextResponse.json({ error: "Anniv must be a whole number between 0 and 99" }, { status: 400 }),
    };
  }

  const startDateResult = parseDateField(coverDates?.startDate, "Start date");
  if ("error" in startDateResult) {
    return {
      error: NextResponse.json({ error: startDateResult.error }, { status: 400 }),
    };
  }

  const endDateResult = parseDateField(coverDates?.endDate, "End date");
  if ("error" in endDateResult) {
    return {
      error: NextResponse.json({ error: endDateResult.error }, { status: 400 }),
    };
  }

  const renewalDateResult = parseDateField(coverDates?.renewalDate, "Renewal date");
  if ("error" in renewalDateResult) {
    return {
      error: NextResponse.json({ error: renewalDateResult.error }, { status: 400 }),
    };
  }

  const orderError = validateCoverDateOrder({
    startDate: coverDates?.startDate,
    endDate: coverDates?.endDate,
    renewalDate: coverDates?.renewalDate,
  });
  if (orderError) {
    return {
      error: NextResponse.json({ error: orderError }, { status: 400 }),
    };
  }

  return {
    data: {
      corpId,
      anniv,
      startDate: startDateResult.date,
      endDate: endDateResult.date,
      renewalDate: renewalDateResult.date,
      agentId,
      smartSync,
    } satisfies Prisma.CorpAnniversaryUncheckedCreateInput,
  };
}

export function corpAnniversaryToFormValues(anniversary: {
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  anniv: number;
  agentId: string;
}): CoverDateFormData {
  const formatDate = (value: Date) => value.toISOString().slice(0, 10);

  return {
    startDate: formatDate(anniversary.startDate),
    endDate: formatDate(anniversary.endDate),
    renewalDate: formatDate(anniversary.renewalDate),
    agentId: anniversary.agentId,
    anniv: String(anniversary.anniv),
  };
}

type CorpAnniversaryClient = Pick<Prisma.TransactionClient, "corpAnniversary">;

export async function upsertCorpAnniversary(
  prisma: CorpAnniversaryClient,
  data: Prisma.CorpAnniversaryUncheckedCreateInput
) {
  const existing = await prisma.corpAnniversary.findFirst({
    where: {
      corpId: data.corpId,
      anniv: data.anniv,
    },
    orderBy: { idx: "desc" },
  });

  if (existing) {
    return prisma.corpAnniversary.update({
      where: { idx: existing.idx },
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        renewalDate: data.renewalDate,
        agentId: data.agentId,
        smartSync: data.smartSync,
      },
    });
  }

  return prisma.corpAnniversary.create({
    data: {
      ...data,
      dateEntered: new Date(),
    },
  });
}

export function isCorpAnniversaryActive(endDate: Date) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);
  return end >= today;
}

export function corpAnniversaryToRenewalListItem(anniversary: {
  idx: number;
  anniv: number;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  corporate: {
    corporate: string;
    corpId: string | null;
    policyNo: string | null;
  };
}): RenewalListItem {
  return {
    id: String(anniversary.idx),
    corporate: anniversary.corporate.corporate,
    corpId: anniversary.corporate.corpId,
    policyNo: anniversary.corporate.policyNo,
    anniv: anniversary.anniv,
    periodStart: anniversary.startDate.toISOString(),
    periodEnd: anniversary.endDate.toISOString(),
    renewalDate: anniversary.renewalDate.toISOString(),
    active: isCorpAnniversaryActive(anniversary.endDate),
  };
}
