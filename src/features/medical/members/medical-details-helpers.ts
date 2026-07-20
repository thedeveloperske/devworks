import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { MedicalDetailsFormData } from "./medical-details-types";

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function parseOptionalFlag(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as string | null };
  if (trimmed !== "0" && trimmed !== "1") {
    return { error: `${label} must be 0 or 1` };
  }
  return { value: trimmed };
}

function parseRequiredDecimal(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 99) {
    return { error: `${label} must be a whole number between 0 and 99` };
  }
  return { value: String(parsed) };
}

function parseOptionalCount(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as string | null };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 99) {
    return { error: `${label} must be a whole number between 0 and 99` };
  }
  return { value: String(parsed) };
}

function parseOptionalDate(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as Date | null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  return { value: date };
}

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

function formatDecimal(value: { toString(): string } | string | null | undefined) {
  return value != null ? String(value) : "";
}

export function buildMemberMedicalData(
  body: Partial<MedicalDetailsFormData> | undefined,
  memberNoFallback?: string
) {
  if (!body) {
    return { data: null };
  }

  const memberNo = body.memberNo?.trim() || memberNoFallback?.trim() || "";
  const hasAnyValue = Object.entries(body).some(([key, value]) => {
    if (key === "memberNo" || key === "anniv") return false;
    return Boolean(String(value ?? "").trim());
  });

  if (!hasAnyValue) {
    return { data: null };
  }

  if (!memberNo) {
    return {
      error: NextResponse.json(
        { error: "Member number is required for medical details" },
        { status: 400 }
      ),
    };
  }

  const annivResult = parseRequiredDecimal(body.anniv || "1", "Anniv");
  if ("error" in annivResult) {
    return {
      error: NextResponse.json({ error: annivResult.error }, { status: 400 }),
    };
  }

  const flagFields = [
    ["asthma", body.asthma, "Asthma"],
    ["diabetes", body.diabetes, "Diabetes"],
    ["hypertension", body.hypertension, "Hypertension"],
    ["convulsionEpilepsy", body.convulsionEpilepsy, "Convulsion / epilepsy"],
    ["gastricDuodenalUlcers", body.gastricDuodenalUlcers, "Gastric / duodenal ulcers"],
    ["heartDisease", body.heartDisease, "Heart disease"],
    ["neurologicalDisease", body.neurologicalDisease, "Neurological disease"],
    ["currentlyIll", body.currentlyIll, "Currently ill"],
    ["gallstones", body.gallstones, "Gallstones"],
    ["recentConsultedDoc", body.recentConsultedDoc, "Recently consulted doctor"],
    ["disabled", body.disabled, "Disabled"],
    ["expectant", body.expectant, "Expectant"],
    ["psychiatricIllness", body.psychiatricIllness, "Psychiatric illness"],
    ["recurrentTonsillitis", body.recurrentTonsillitis, "Recurrent tonsillitis"],
    ["arthritisFibroids", body.arthritisFibroids, "Arthritis / fibroids"],
    ["menstrualDisorder", body.menstrualDisorder, "Menstrual disorder"],
    ["cancer", body.cancer, "Cancer"],
    ["smokes", body.smokes, "Smokes"],
    ["takesAlcohol", body.takesAlcohol, "Takes alcohol"],
    ["onRegularMedication", body.onRegularMedication, "On regular medication"],
  ] as const;

  const flags: Record<string, string | null> = {};
  for (const [key, value, label] of flagFields) {
    const result = parseOptionalFlag(value, label);
    if ("error" in result) {
      return {
        error: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    flags[key] = result.value;
  }

  const pastDeliveriesResult = parseOptionalCount(
    body.pastDeliveries,
    "Past deliveries"
  );
  if ("error" in pastDeliveriesResult) {
    return {
      error: NextResponse.json(
        { error: pastDeliveriesResult.error },
        { status: 400 }
      ),
    };
  }
  const normalResult = parseOptionalCount(body.normal, "Normal deliveries");
  if ("error" in normalResult) {
    return {
      error: NextResponse.json({ error: normalResult.error }, { status: 400 }),
    };
  }
  const caesarianResult = parseOptionalCount(body.caesarian, "Caesarian");
  if ("error" in caesarianResult) {
    return {
      error: NextResponse.json({ error: caesarianResult.error }, { status: 400 }),
    };
  }

  const expectedDeliveryDateResult = parseOptionalDate(
    body.expectedDeliveryDate,
    "Expected delivery date"
  );
  if ("error" in expectedDeliveryDateResult) {
    return {
      error: NextResponse.json(
        { error: expectedDeliveryDateResult.error },
        { status: 400 }
      ),
    };
  }

  return {
    data: {
      memberNo,
      anniv: annivResult.value,
      asthma: flags.asthma,
      diabetes: flags.diabetes,
      hypertension: flags.hypertension,
      convulsionEpilepsy: flags.convulsionEpilepsy,
      gastricDuodenalUlcers: flags.gastricDuodenalUlcers,
      heartDisease: flags.heartDisease,
      neurologicalDisease: flags.neurologicalDisease,
      currentlyIll: flags.currentlyIll,
      currentIllDetails: trimOrNull(body.currentIllDetails),
      gallstones: flags.gallstones,
      recentConsultedDoc: flags.recentConsultedDoc,
      recentConsultedDetails: trimOrNull(body.recentConsultedDetails),
      disabled: flags.disabled,
      disabilityDetails: trimOrNull(body.disabilityDetails),
      pastDeliveries: pastDeliveriesResult.value,
      normal: normalResult.value,
      caesarian: caesarianResult.value,
      expectant: flags.expectant,
      expectedDeliveryDate: expectedDeliveryDateResult.value,
      psychiatricIllness: flags.psychiatricIllness,
      recurrentTonsillitis: flags.recurrentTonsillitis,
      arthritisFibroids: flags.arthritisFibroids,
      menstrualDisorder: flags.menstrualDisorder,
      cancer: flags.cancer,
      smokes: flags.smokes,
      takesAlcohol: flags.takesAlcohol,
      onRegularMedication: flags.onRegularMedication,
      regularMedicationDetails: trimOrNull(body.regularMedicationDetails),
      futureHospitalization: trimOrNull(body.futureHospitalization),
      currentDoctor: trimOrNull(body.currentDoctor),
    } satisfies Prisma.MemberMedicalUncheckedCreateInput,
  };
}

export function memberMedicalToFormValues(row: {
  memberNo: string;
  anniv: { toString(): string } | string;
  asthma: { toString(): string } | string | null;
  diabetes: { toString(): string } | string | null;
  hypertension: { toString(): string } | string | null;
  convulsionEpilepsy: { toString(): string } | string | null;
  gastricDuodenalUlcers: { toString(): string } | string | null;
  heartDisease: { toString(): string } | string | null;
  neurologicalDisease: { toString(): string } | string | null;
  currentlyIll: { toString(): string } | string | null;
  currentIllDetails: string | null;
  gallstones: { toString(): string } | string | null;
  recentConsultedDoc: { toString(): string } | string | null;
  recentConsultedDetails: string | null;
  disabled: { toString(): string } | string | null;
  disabilityDetails: string | null;
  pastDeliveries: { toString(): string } | string | null;
  normal: { toString(): string } | string | null;
  caesarian: { toString(): string } | string | null;
  expectant: { toString(): string } | string | null;
  expectedDeliveryDate: Date | string | null;
  psychiatricIllness: { toString(): string } | string | null;
  recurrentTonsillitis: { toString(): string } | string | null;
  arthritisFibroids: { toString(): string } | string | null;
  menstrualDisorder: { toString(): string } | string | null;
  cancer: { toString(): string } | string | null;
  smokes: { toString(): string } | string | null;
  takesAlcohol: { toString(): string } | string | null;
  onRegularMedication: { toString(): string } | string | null;
  regularMedicationDetails: string | null;
  futureHospitalization: string | null;
  currentDoctor: string | null;
}): MedicalDetailsFormData {
  return {
    memberNo: row.memberNo,
    anniv: formatDecimal(row.anniv) || "1",
    asthma: formatDecimal(row.asthma),
    diabetes: formatDecimal(row.diabetes),
    hypertension: formatDecimal(row.hypertension),
    convulsionEpilepsy: formatDecimal(row.convulsionEpilepsy),
    gastricDuodenalUlcers: formatDecimal(row.gastricDuodenalUlcers),
    heartDisease: formatDecimal(row.heartDisease),
    neurologicalDisease: formatDecimal(row.neurologicalDisease),
    currentlyIll: formatDecimal(row.currentlyIll),
    currentIllDetails: row.currentIllDetails ?? "",
    gallstones: formatDecimal(row.gallstones),
    recentConsultedDoc: formatDecimal(row.recentConsultedDoc),
    recentConsultedDetails: row.recentConsultedDetails ?? "",
    disabled: formatDecimal(row.disabled),
    disabilityDetails: row.disabilityDetails ?? "",
    pastDeliveries: formatDecimal(row.pastDeliveries),
    normal: formatDecimal(row.normal),
    caesarian: formatDecimal(row.caesarian),
    expectant: formatDecimal(row.expectant),
    expectedDeliveryDate: formatDateValue(row.expectedDeliveryDate),
    psychiatricIllness: formatDecimal(row.psychiatricIllness),
    recurrentTonsillitis: formatDecimal(row.recurrentTonsillitis),
    arthritisFibroids: formatDecimal(row.arthritisFibroids),
    menstrualDisorder: formatDecimal(row.menstrualDisorder),
    cancer: formatDecimal(row.cancer),
    smokes: formatDecimal(row.smokes),
    takesAlcohol: formatDecimal(row.takesAlcohol),
    onRegularMedication: formatDecimal(row.onRegularMedication),
    regularMedicationDetails: row.regularMedicationDetails ?? "",
    futureHospitalization: row.futureHospitalization ?? "",
    currentDoctor: row.currentDoctor ?? "",
  };
}

export async function upsertMemberMedical(
  prisma: {
    memberMedical: {
      findUnique: (args: {
        where: {
          memberNo_anniv: { memberNo: string; anniv: string | number };
        };
      }) => Promise<{ memberNo: string; anniv: unknown } | null>;
      create: (args: {
        data: Prisma.MemberMedicalUncheckedCreateInput;
      }) => Promise<unknown>;
      update: (args: {
        where: {
          memberNo_anniv: { memberNo: string; anniv: string | number };
        };
        data: Prisma.MemberMedicalUncheckedUpdateInput;
      }) => Promise<unknown>;
    };
  },
  data: Prisma.MemberMedicalUncheckedCreateInput
) {
  const annivKey = String(data.anniv);
  const existing = await prisma.memberMedical.findUnique({
    where: {
      memberNo_anniv: {
        memberNo: data.memberNo,
        anniv: annivKey,
      },
    },
  });

  if (existing) {
    const { memberNo: _memberNo, anniv: _anniv, ...updateData } = data;
    return prisma.memberMedical.update({
      where: {
        memberNo_anniv: {
          memberNo: data.memberNo,
          anniv: annivKey,
        },
      },
      data: updateData,
    });
  }

  return prisma.memberMedical.create({ data });
}
