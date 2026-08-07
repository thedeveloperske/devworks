import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { stripThousands } from "@/lib/format";
import type {
  ClaimDetailsFormData,
  ClaimDiagnosisFormData,
  ClaimFormTabData,
  ClaimLineItemFormData,
} from "./types";

export type CreateClaimInput = {
  details?: Partial<ClaimDetailsFormData>;
  claimForm?: Partial<ClaimFormTabData>;
  lineItems?: ClaimLineItemFormData[];
  diagnoses?: ClaimDiagnosisFormData[];
};

function trimOrNull(value?: string | null, maxLength?: number) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

type ParseSuccess<T> = { value: T };
type ParseFailure = { error: string };
type ParseResult<T> = ParseSuccess<T> | ParseFailure;

function isParseFailure<T>(result: ParseResult<T>): result is ParseFailure {
  return "error" in result;
}

function parseRequiredString(
  value: string | undefined,
  label: string
): ParseResult<string> {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  return { value: trimmed };
}

function parseRequiredDecimal(
  value: string | undefined,
  label: string
): ParseResult<string> {
  const trimmed = stripThousands(value);
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { error: `${label} must be a number` };
  }
  return { value: String(parsed) };
}

function parseOptionalDecimal(
  value: string | undefined
): ParseResult<string | null> {
  const trimmed = stripThousands(value);
  if (!trimmed) return { value: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { error: "Invalid number" };
  }
  return { value: String(parsed) };
}

function parseRequiredDate(
  value: string | undefined,
  label: string
): ParseResult<Date> {
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
  return { value: date };
}

function parseOptionalDate(
  value: string | undefined,
  label: string
): ParseResult<Date | null> {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  return { value: date };
}

function errorResponse(message: string, status = 400) {
  return {
    error: NextResponse.json({ error: message }, { status }),
  };
}

export type BuiltClaimData = {
  claimNo: string;
  bill: Prisma.BillCreateInput;
  claimForm: Prisma.ClaimFormCreateInput;
  diagnoses: Prisma.MemberDiagnosisCreateManyInput[];
  lineItems: Prisma.ClaimLineItemCreateManyInput[];
  preAuthNo: string | null;
  invoicedAmount: string;
};

/** Validates create-claim payload and builds Prisma create payloads (claimNo filled later). */
export function buildCreateClaimData(body: CreateClaimInput):
  | { error: NextResponse }
  | { data: Omit<BuiltClaimData, "claimNo"> & { claimNo?: string } } {
  const details = body.details ?? {};
  const claimForm = body.claimForm ?? {};
  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  const diagnoses = Array.isArray(body.diagnoses) ? body.diagnoses : [];

  const memberNoResult = parseRequiredString(details.memberNo, "Member no");
  if (isParseFailure(memberNoResult)) return errorResponse(memberNoResult.error);

  const providerResult = parseRequiredDecimal(details.provider, "Provider");
  if (isParseFailure(providerResult)) return errorResponse(providerResult.error);

  const claimNatureResult = parseRequiredDecimal(
    details.claimNature,
    "Claim nature"
  );
  if (isParseFailure(claimNatureResult)) {
    return errorResponse(claimNatureResult.error);
  }

  const invoiceDateResult = parseRequiredDate(
    details.invoiceDate,
    "Invoice date"
  );
  if (isParseFailure(invoiceDateResult)) {
    return errorResponse(invoiceDateResult.error);
  }

  const visitDateResult = parseRequiredDate(claimForm.visitDate, "Visit date");
  if (isParseFailure(visitDateResult)) return errorResponse(visitDateResult.error);

  const filledLineItems = lineItems.filter((row) => {
    const hasService = Boolean(row.service?.trim());
    const hasInvoice = Boolean(row.invoiceNo?.trim());
    const hasAmount =
      Number.parseFloat(stripThousands(row.amount || "0") || "0") > 0 ||
      Number.parseFloat(stripThousands(row.unitPrice || "0") || "0") > 0 ||
      Boolean(row.itemName?.trim());
    return hasService || hasInvoice || hasAmount;
  });

  if (filledLineItems.length === 0) {
    return errorResponse("Add at least one line item");
  }

  for (const [index, row] of filledLineItems.entries()) {
    const label = `Line item ${index + 1}`;
    if (!row.service?.trim()) {
      return errorResponse(`${label}: Service is required`);
    }
    if (!row.invoiceNo?.trim()) {
      return errorResponse(`${label}: Invoice no is required`);
    }
    const qty = Number.parseFloat(stripThousands(row.quantity || "0") || "0");
    const unitPrice = Number.parseFloat(
      stripThousands(row.unitPrice || "0") || "0"
    );
    if (!Number.isFinite(qty) || qty <= 0) {
      return errorResponse(`${label}: Quantity must be greater than zero`);
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return errorResponse(`${label}: Unit price is invalid`);
    }
  }

  const primaryInvoiceNo =
    details.invoiceNo?.trim() || filledLineItems[0]?.invoiceNo?.trim() || "";
  if (!primaryInvoiceNo) {
    return errorResponse("Invoice no is required");
  }

  const primaryService =
    details.service?.trim() || filledLineItems[0]?.service?.trim() || "";
  const serviceResult = parseRequiredDecimal(primaryService, "Service");
  if (isParseFailure(serviceResult)) return errorResponse(serviceResult.error);

  const invoicedAmountResult = parseRequiredDecimal(
    details.invoicedAmount,
    "Invoiced amount"
  );
  let invoicedAmount: string;
  if (isParseFailure(invoicedAmountResult)) {
    // Fall back to summing line items if details amount missing.
    const total = filledLineItems.reduce((sum, row) => {
      const amount = Number.parseFloat(stripThousands(row.amount || "0") || "0");
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    if (total <= 0) {
      return errorResponse(invoicedAmountResult.error);
    }
    invoicedAmount = String(Number(total.toFixed(2)));
  } else {
    invoicedAmount = invoicedAmountResult.value;
  }

  const dateReceivedResult = parseOptionalDate(
    details.dateReceived,
    "Date received"
  );
  if (isParseFailure(dateReceivedResult)) {
    return errorResponse(dateReceivedResult.error);
  }

  const doctorDateResult = parseOptionalDate(claimForm.doctorDate, "Doctor date");
  if (isParseFailure(doctorDateResult)) {
    return errorResponse(doctorDateResult.error);
  }

  const dateAdmittedResult = parseOptionalDate(
    claimForm.dateAdmitted,
    "Date admitted"
  );
  if (isParseFailure(dateAdmittedResult)) {
    return errorResponse(dateAdmittedResult.error);
  }

  const dateDischargedResult = parseOptionalDate(
    claimForm.dateDischarged,
    "Date discharged"
  );
  if (isParseFailure(dateDischargedResult)) {
    return errorResponse(dateDischargedResult.error);
  }

  const annivResult = parseOptionalDecimal(details.anniv);
  if (isParseFailure(annivResult)) return errorResponse("Anniv must be a number");

  const preAuthResult = parseOptionalDecimal(details.preAuthNo);
  if (isParseFailure(preAuthResult)) {
    return errorResponse("Preauth no must be a number");
  }

  const refundResult = parseOptionalDecimal(details.refund);
  if (isParseFailure(refundResult)) return errorResponse("Pay to is invalid");

  const fundResult = parseOptionalDecimal(details.fund);
  if (isParseFailure(fundResult)) return errorResponse("Fund is invalid");

  const attendingDocResult = parseOptionalDecimal(claimForm.attendingDoc);
  if (isParseFailure(attendingDocResult)) {
    return errorResponse("Attending doctor must be a number");
  }

  const visitDaysResult = parseOptionalDecimal(claimForm.visitDays);
  if (isParseFailure(visitDaysResult)) {
    return errorResponse("Visit days must be a number");
  }

  const doctorSignResult = parseOptionalDecimal(claimForm.doctorSign);
  if (isParseFailure(doctorSignResult)) {
    return errorResponse("Doctor sign is invalid");
  }

  const claimFormSignedResult = parseOptionalDecimal(claimForm.claimFormSigned);
  if (isParseFailure(claimFormSignedResult)) {
    return errorResponse("Patient sign is invalid");
  }

  const diagnosisRows: Prisma.MemberDiagnosisCreateManyInput[] = [];
  for (const [index, row] of diagnoses.entries()) {
    const diagnosis = row.diagnosis?.trim();
    if (!diagnosis) continue;
    const parsed = Number(diagnosis);
    if (!Number.isFinite(parsed)) {
      return errorResponse(`Diagnosis ${index + 1} must be a number`);
    }
    diagnosisRows.push({
      claimNo: "", // filled after claim no generated
      memberNo: memberNoResult.value,
      diagnosis: String(parsed),
    });
  }

  const lineItemRows: Prisma.ClaimLineItemCreateManyInput[] = filledLineItems.map(
    (row) => {
      const quantity = Number.parseFloat(
        stripThousands(row.quantity || "0") || "0"
      );
      const unitPrice = Number.parseFloat(
        stripThousands(row.unitPrice || "0") || "0"
      );
      const amount = Number.parseFloat(stripThousands(row.amount || "0") || "0");
      const computedAmount =
        Number.isFinite(amount) && amount > 0
          ? amount
          : quantity * unitPrice;

      return {
        claimNo: "",
        invoiceNo: row.invoiceNo.trim().slice(0, 30),
        service: row.service.trim(),
        itemCode: (row.itemCode?.trim() || "-").slice(0, 30),
        itemName: (row.itemName?.trim() || "Item").slice(0, 255),
        groupName: trimOrNull(row.groupName, 100),
        quantity: String(quantity),
        unitPrice: String(unitPrice),
        amount: String(Number(computedAmount.toFixed(2))),
      };
    }
  );

  // claimNo / claimFormNo filled in the route after generation
  const bill: Prisma.BillCreateInput = {
    invoiceNo: primaryInvoiceNo.slice(0, 30),
    claimNo: "",
    claimFormNo: "",
    provider: providerResult.value,
    memberNo: memberNoResult.value.slice(0, 20),
    service: serviceResult.value,
    claimNature: claimNatureResult.value,
    invoiceDate: invoiceDateResult.value,
    invoicedAmount,
    amountPayable: invoicedAmount,
    batchNo: trimOrNull(details.batchNo, 15),
    dateReceived: dateReceivedResult.value,
    anniv: annivResult.value,
    preAuthNo: preAuthResult.value,
    corpId: trimOrNull(details.corpId, 10),
    familyNo: trimOrNull(details.familyNo, 20),
    priDep: details.priDep?.trim() || null,
    entryNotes: trimOrNull(details.entryNotes, 30),
    notes: trimOrNull(details.notes, 50),
    claimSource: trimOrNull(details.claimSource, 30),
    refund: refundResult.value,
    fund: fundResult.value ?? "0",
    proxyPayee: trimOrNull(details.proxyPayee, 100),
    billSerialNo: trimOrNull(details.billSerialNo, 20),
  };

  const claimFormData: Prisma.ClaimFormCreateInput = {
    claimNo: "",
    visitDate: visitDateResult.value,
    attendingDoc: attendingDocResult.value,
    doctorSign: doctorSignResult.value ?? "0",
    doctorDate: doctorDateResult.value,
    claimFormSigned: claimFormSignedResult.value ?? "0",
    dateAdmitted: dateAdmittedResult.value,
    dateDischarged: dateDischargedResult.value,
    visitDays: visitDaysResult.value,
  };

  return {
    data: {
      bill,
      claimForm: claimFormData,
      diagnoses: diagnosisRows,
      lineItems: lineItemRows,
      preAuthNo: preAuthResult.value,
      invoicedAmount,
    },
  };
}
