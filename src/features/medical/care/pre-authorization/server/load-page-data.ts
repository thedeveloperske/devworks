import { loadHospitalWardOptions } from "@/features/medical/admin/hospital-wards/server/load-page-data";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import { prisma } from "@/lib/prisma";
import type { PreAuthorizationListItem } from "../types";

function formatDateIso(value: Date | null | undefined) {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export async function loadPreAuthorizationPageData() {
  const [rows, providerOptions, hospitalWardOptions] = await Promise.all([
    prisma.preAuthorization.findMany({
      orderBy: { code: "desc" },
    }),
    loadProviderOptions(),
    loadHospitalWardOptions(),
  ]);

  const providerNameByCode = new Map(
    providerOptions.map((option) => [option.value, option.label])
  );

  const preAuthorizations: PreAuthorizationListItem[] = rows.map((row) => {
    const providerCode = String(row.provider);
    return {
      id: String(row.code),
      code: row.code,
      memberNo: row.memberNo,
      provider: providerCode,
      providerName: providerNameByCode.get(providerCode) ?? null,
      dateReported: formatDateIso(row.dateReported),
      reportedBy: row.reportedBy,
      dateAuthorized: formatDateIso(row.dateAuthorized),
      authorizedBy: row.authorizedBy,
      preDiagnosis: row.preDiagnosis,
      validityDate: formatDateIso(row.validityDate),
    };
  });

  return {
    preAuthorizations,
    providerOptions,
    hospitalWardOptions,
  };
}
