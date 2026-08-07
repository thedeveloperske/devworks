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

function parseRequiredString(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  return { value: trimmed };
}

function parseRequiredDecimal(value: string | undefined, label: string) {
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

function parseOptionalDecimal(value: string | undefined) {
  const trimmed = stripThousands(value);
  if (!trimmed) return { value: null as string | null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { error: "Invalid number" };
  }
  return { value: String(parsed) };
}

function parseRequiredDate(value: string | undefined, label: string) {
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
  if ("error" in memberNoResult) return errorResponse(memberNoResult.error);

  const providerResult = parseRequiredDecimal(details.provider, "Provider");
  if ("error" in providerResult) return errorResponse(providerResult.error);

  const claimNatureResult = parseRequiredDecimal(
    details.claimNature,
    "Claim nature"
  );
  if ("error" in claimNatureResult) {
    return errorResponse(claimNatureResult.error);
  }

  const invoiceDateResult = parseRequiredDate(
    details.invoiceDate,
    "Invoice date"
  );
  if ("error" in invoiceDateResult) {
    return errorResponse(invoiceDateResult.error);
  }

  const visitDateResult = parseRequiredDate(claimForm.visitDate, "Visit date");
  if ("error" in visitDateResult) return errorResponse(visitDateResult.error);

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
  if ("error" in serviceResult) return errorResponse(serviceResult.error);

  const invoicedAmountResult = parseRequiredDecimal(
    details.invoicedAmount,
    "Invoiced amount"
  );
  if ("error" in invoicedAmountResult) {
    // Fall back to summing line items if details amount missing.
    const total = filledLineItems.reduce((sum, row) => {
      const amount = Number.parseFloat(stripThousands(row.amount || "0") || "0");
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    if (total <= 0) {
      return errorResponse(invoicedAmountResult.error);
    }
  }

  const invoicedAmount =
    "error" in invoicedAmountResult
      ? String(
          Number(
            filledLineItems
              .reduce((sum, row) => {
                const amount = Number.parseFloat(
                  stripThousands(row.amount || "0") || "0"
                );
                return sum + (Number.isFinite(amount) ? amount : 0);
              }, 0)
              .toFixed(2)
          )
        )
      : invoicedAmountResult.value;

  const dateReceivedResult = parseOptionalDate(
    details.dateReceived,
    "Date received"
  );
  if ("error" in dateReceivedResult) {
    return errorResponse(dateReceivedResult.error);
  }

  const doctorDateResult = parseOptionalDate(claimForm.doctorDate, "Doctor date");
  if ("error" in doctorDateResult) return errorResponse(doctorDateResult.error);

  const dateAdmittedResult = parseOptionalDate(
    claimForm.dateAdmitted,
    "Date admitted"
  );
  if ("error" in dateAdmittedResult) {
    return errorResponse(dateAdmittedResult.error);
  }

  const dateDischargedResult = parseOptionalDate(
    claimForm.dateDischarged,
    "Date discharged"
  );
  if ("error" in dateDischargedResult) {
    return errorResponse(dateDischargedResult.error);
  }

  const annivResult = parseOptionalDecimal(details.anniv);
  if ("error" in annivResult) return errorResponse("Anniv must be a number");

  const preAuthResult = parseOptionalDecimal(details.preAuthNo);
  if ("error" in preAuthResult) {
    return errorResponse("Preauth no must be a number");
  }

  const refundResult = parseOptionalDecimal(details.refund);
  if ("error" in refundResult) return errorResponse("Pay to is invalid");

  const fundResult = parseOptionalDecimal(details.fund);
  if ("error" in fundResult) return errorResponse("Fund is invalid");

  const attendingDocResult = parseOptionalDecimal(claimForm.attendingDoc);
  if ("error" in attendingDocResult) {
    return errorResponse("Attending doctor must be a number");
  }

  const visitDaysResult = parseOptionalDecimal(claimForm.visitDays);
  if ("error" in visitDaysResult) {
    return errorResponse("Visit days must be a number");
  }

  const doctorSignResult = parseOptionalDecimal(claimForm.doctorSign);
  if ("error" in doctorSignResult) {
    return errorResponse("Doctor sign is invalid");
  }

  const claimFormSignedResult = parseOptionalDecimal(claimForm.claimFormSigned);
  if ("error" in claimFormSignedResult) {
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
