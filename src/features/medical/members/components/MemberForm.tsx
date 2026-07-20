"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BenefitsTab,
  BioDataTab,
  HistoryOfCoverTab,
  MedicalDetailsTab,
  AcceptanceTab,
  MiscellaneousTab,
  PrincipalInformationTab,
} from "./tabs";
import { Button, ButtonLink } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import {
  applyAnniversaryDateFieldChange,
  createEmptyMemberAnniversaryRow,
  createEmptyMemberBenefitRow,
  defaultBioDataForm,
  defaultMedicalDetailsForm,
  defaultMemberAcceptanceForm,
  defaultPrincipalInformationForm,
  memberPrincipalTabs,
  memberDependantTabs,
  type BioDataFormData,
  type FamilyDependantRow,
  type MedicalDetailsFormData,
  type MemberAcceptanceFormData,
  type MemberAnniversaryFormData,
  type MemberBenefitFormData,
  type MembersCorpGroupBenefit,
  type MemberPrincipalTabId,
  type PrincipalInformationFormData,
  type PrincipalOption,
  type SavedMemberSummary,
} from "@/features/medical/members";
import type { LookupOption } from "@/features/medical/lookups/types";

type MemberFormMode = "principal" | "dependant";

type MemberFormProps = {
  mode?: MemberFormMode;
  /** Principal member no — required when creating a dependant. */
  principalMemberNo?: string;
  initialPrincipalInformation?: Partial<PrincipalInformationFormData>;
  initialBioData?: Partial<BioDataFormData>;
  initialMedicalDetails?: Partial<MedicalDetailsFormData>;
  initialBenefits?: MemberBenefitFormData[];
  initialCoverHistory?: MemberAnniversaryFormData[];
  initialAcceptance?: Partial<MemberAcceptanceFormData>;
  initialDependants?: FamilyDependantRow[];
  memberId?: string;
  embedded?: boolean;
  corporateId?: string;
  corpId?: string;
  corporateName?: string;
  /** Normalized branch key from the selected corporate. */
  corporateBranch?: string;
  /** From corporate's latest anniversary — locked on History of Cover. */
  corporateEndDate?: string;
  corporateRenewalDate?: string;
  /** Latest corp anniversary number from corp_anniversary. */
  corporateAnniv?: string;
  agentOptions: LookupOption[];
  categoryOptions: LookupOption[];
  benefitOptions: LookupOption[];
  /** Benefits available from corp_groups for this corporate. */
  corpGroupBenefits?: MembersCorpGroupBenefit[];
  corporateOptions: LookupOption[];
  principalOptions: PrincipalOption[];
  onSuccess?: (saved: SavedMemberSummary) => void;
  onCancel?: () => void;
  onAddDependant?: () => void;
  onEditDependant?: (memberNo: string) => void;
};

const fieldLabelClass = "mb-0.5 block text-[12px] font-medium text-slate-700";
const fieldInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

export function MemberForm({
  mode = "principal",
  principalMemberNo = "",
  initialPrincipalInformation,
  initialBioData,
  initialMedicalDetails,
  initialBenefits,
  initialCoverHistory,
  initialAcceptance,
  initialDependants = [],
  memberId,
  embedded = false,
  corporateId = "",
  corpId = "",
  corporateName = "",
  corporateBranch = "",
  corporateEndDate = "",
  corporateRenewalDate = "",
  corporateAnniv = "",
  agentOptions,
  categoryOptions,
  benefitOptions,
  corpGroupBenefits = [],
  onSuccess,
  onCancel,
  onAddDependant,
  onEditDependant,
}: MemberFormProps) {
  const router = useRouter();
  const isDependantMode = mode === "dependant";
  const resolvedCorporateAnniv = corporateAnniv || "1";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<MemberPrincipalTabId>(
    isDependantMode ? "bioData" : "principalInformation"
  );
  const [principalInformation, setPrincipalInformation] =
    useState<PrincipalInformationFormData>({
      ...defaultPrincipalInformationForm,
      ...initialPrincipalInformation,
      corpId: initialPrincipalInformation?.corpId || corpId || "",
      branch:
        initialPrincipalInformation?.branch || corporateBranch || "",
      familySize: initialPrincipalInformation?.familySize || "1",
    });
  // Dependants have their own identity — never inherit the principal's
  // name/contact details into their bio data.
  const [bioData, setBioData] = useState<BioDataFormData>({
    ...defaultBioDataForm,
    ...initialBioData,
    memberNo:
      initialBioData?.memberNo ||
      (isDependantMode ? "" : initialPrincipalInformation?.memberNo || ""),
    familyNo:
      initialBioData?.familyNo ||
      initialPrincipalInformation?.familyNo ||
      "",
    corpId:
      initialBioData?.corpId ||
      initialPrincipalInformation?.corpId ||
      corpId ||
      "",
    surname:
      initialBioData?.surname ||
      (isDependantMode ? "" : initialPrincipalInformation?.surname || ""),
    firstName:
      initialBioData?.firstName ||
      (isDependantMode ? "" : initialPrincipalInformation?.firstName || ""),
    otherNames:
      initialBioData?.otherNames ||
      (isDependantMode ? "" : initialPrincipalInformation?.otherNames || ""),
    mobileNo:
      initialBioData?.mobileNo ||
      (isDependantMode ? "" : initialPrincipalInformation?.mobileNo || ""),
    emailAdd:
      initialBioData?.emailAdd ||
      (isDependantMode ? "" : initialPrincipalInformation?.email || ""),
    relationToPrincipal:
      initialBioData?.relationToPrincipal ||
      (isDependantMode ? "" : "1"),
    familyTitle:
      initialBioData?.familyTitle || (isDependantMode ? "" : "1"),
  });
  const [medicalDetails, setMedicalDetails] = useState<MedicalDetailsFormData>({
    ...defaultMedicalDetailsForm,
    ...initialMedicalDetails,
    memberNo:
      initialMedicalDetails?.memberNo ||
      initialPrincipalInformation?.memberNo ||
      "",
    anniv: initialMedicalDetails?.anniv || resolvedCorporateAnniv,
  });
  const [benefitRows, setBenefitRows] = useState<MemberBenefitFormData[]>(
    initialBenefits?.length
      ? initialBenefits
      : [
          createEmptyMemberBenefitRow({
            memberNo: initialPrincipalInformation?.memberNo || "",
            corpId: initialPrincipalInformation?.corpId || corpId || "",
            anniv: resolvedCorporateAnniv,
          }),
        ]
  );
  const [coverHistoryRows, setCoverHistoryRows] = useState<
    MemberAnniversaryFormData[]
  >(
    initialCoverHistory?.length
      ? initialCoverHistory.map((row) => ({
          ...row,
          endDate: corporateEndDate || row.endDate,
          renewalDate: corporateRenewalDate || row.renewalDate,
        }))
      : [
          createEmptyMemberAnniversaryRow({
            memberNo: initialPrincipalInformation?.memberNo || "",
            anniv: resolvedCorporateAnniv,
            endDate: corporateEndDate,
            renewalDate: corporateRenewalDate,
          }),
        ]
  );
  const [acceptance, setAcceptance] = useState<MemberAcceptanceFormData>({
    ...defaultMemberAcceptanceForm,
    ...initialAcceptance,
    memberNo:
      initialAcceptance?.memberNo ||
      initialPrincipalInformation?.memberNo ||
      "",
  });

  const applyIdentityNumbers = (familyNo: string, memberNo: string) => {
    setPrincipalInformation((prev) => ({ ...prev, familyNo, memberNo }));
    setBioData((prev) => ({ ...prev, familyNo, memberNo }));
    setMedicalDetails((prev) => ({ ...prev, memberNo }));
    setBenefitRows((prev) => prev.map((row) => ({ ...row, memberNo })));
    setCoverHistoryRows((prev) => prev.map((row) => ({ ...row, memberNo })));
    setAcceptance((prev) => ({ ...prev, memberNo }));
  };

  const resolvedMemberNo = principalInformation.memberNo;
  const resolvedFamilyNo = principalInformation.familyNo;

  const categoryBenefitRows = useMemo(() => {
    const category = principalInformation.category?.trim();
    if (!category) return [] as MembersCorpGroupBenefit[];
    const anniv = resolvedCorporateAnniv;
    return corpGroupBenefits.filter(
      (row) =>
        row.category === category &&
        (!anniv || row.anniv === anniv)
    );
  }, [
    corpGroupBenefits,
    principalInformation.category,
    resolvedCorporateAnniv,
  ]);

  const categoryBenefitOptions = useMemo(() => {
    const codes = new Set(categoryBenefitRows.map((row) => row.benefit));
    for (const row of benefitRows) {
      if (row.benefit?.trim()) codes.add(row.benefit.trim());
    }
    if (codes.size === 0) return [] as LookupOption[];
    return benefitOptions.filter((option) => codes.has(option.value));
  }, [benefitOptions, benefitRows, categoryBenefitRows]);

  const handlePrincipalInformationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "memberNo") {
      applyIdentityNumbers(principalInformation.familyNo, value);
      return;
    }
    if (name === "familyNo") {
      setPrincipalInformation((prev) => ({ ...prev, familyNo: value }));
      setBioData((prev) => ({ ...prev, familyNo: value }));
      return;
    }
    if (name === "category") {
      setPrincipalInformation((prev) => ({ ...prev, category: value }));
      const category = value.trim();
      const resolvedCorpId = principalInformation.corpId || corpId;
      const matching = corpGroupBenefits.filter(
        (row) =>
          row.category === category &&
          (!resolvedCorporateAnniv || row.anniv === resolvedCorporateAnniv)
      );
      if (!category || matching.length === 0) {
        setBenefitRows([
          createEmptyMemberBenefitRow({
            memberNo: principalInformation.memberNo,
            corpId: resolvedCorpId,
            anniv: resolvedCorporateAnniv,
          }),
        ]);
      } else {
        setBenefitRows(
          matching.map((row) =>
            createEmptyMemberBenefitRow({
              memberNo: principalInformation.memberNo,
              corpId: resolvedCorpId,
              benefit: row.benefit,
              anniv: row.anniv || resolvedCorporateAnniv,
              policyLimit: row.policyLimit,
              sharing: row.sharing,
              subLimitOf: row.subLimitOf,
              waitingPeriod: row.waitingPeriod,
            })
          )
        );
      }
      return;
    }
    setPrincipalInformation((prev) => ({ ...prev, [name]: value }));
    if (name === "corpId") {
      setBioData((prev) => ({ ...prev, corpId: value }));
    }
    if (
      name === "surname" ||
      name === "firstName" ||
      name === "otherNames" ||
      name === "mobileNo"
    ) {
      setBioData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "email") {
      setBioData((prev) => ({ ...prev, emailAdd: value }));
    }
  };

  const handleBioDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBioData((prev) => {
      const next = { ...prev, [name]: value };
      // Relationship to Principal is never edited directly; it follows the
      // family title selection.
      if (name === "familyTitle") {
        next.relationToPrincipal = value;
      }
      return next;
    });
  };

  const handleMedicalDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const detailFieldBySwitch: Partial<
      Record<keyof MedicalDetailsFormData, keyof MedicalDetailsFormData>
    > = {
      currentlyIll: "currentIllDetails",
      recentConsultedDoc: "recentConsultedDetails",
      onRegularMedication: "regularMedicationDetails",
      disabled: "disabilityDetails",
      expectant: "expectedDeliveryDate",
    };

    setMedicalDetails((prev) => {
      const next = { ...prev, [name]: value };
      const detailField =
        detailFieldBySwitch[name as keyof MedicalDetailsFormData];
      if (detailField && value !== "1") {
        next[detailField] = "";
      }
      return next;
    });
  };

  const handleAcceptanceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAcceptance((prev) => {
      const next = { ...prev, [name]: value };
      if (
        name === "status" &&
        value !== "2" &&
        value !== "3"
      ) {
        next.defRej = "";
      }
      return next;
    });
  };

  const handleCoverHistoryRowChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCoverHistoryRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? applyAnniversaryDateFieldChange(row, name, value)
          : row
      )
    );
  };

  const validateRequiredFields = (): string | null => {
    if (isDependantMode) {
      if (!bioData.surname.trim()) {
        return "Surname is required (Bio Data)";
      }
      if (!bioData.firstName.trim()) {
        return "First name is required (Bio Data)";
      }
      if (!bioData.relationToPrincipal.trim()) {
        return "Relationship to principal is required (Bio Data)";
      }
      if (!bioData.familyTitle.trim()) {
        return "Family title is required (Bio Data)";
      }
    } else {
      if (!principalInformation.surname.trim()) {
        return "Surname is required (Principal Information)";
      }
      if (!principalInformation.firstName.trim()) {
        return "First name is required (Principal Information)";
      }
      if (!principalInformation.category.trim()) {
        return "Category is required (Principal Information)";
      }
    }
    if (!bioData.dob.trim()) {
      return "Date of birth is required (Bio Data)";
    }
    if (!bioData.gender.trim()) {
      return "Gender is required (Bio Data)";
    }
    if (coverHistoryRows.some((row) => !row.startDate.trim())) {
      return "Start date is required (History of Cover)";
    }
    if (!acceptance.status.trim()) {
      return "Status is required (Acceptance)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!corporateId) {
      setError("Corporate is required");
      setLoading(false);
      return;
    }

    if (isDependantMode && !principalMemberNo.trim()) {
      setError("Principal is required to create a dependant");
      setLoading(false);
      return;
    }

    const validationError = validateRequiredFields();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const resolvedCorpId = principalInformation.corpId || corpId;
    let memberNo = resolvedMemberNo;
    let familyNo = resolvedFamilyNo;

    if (isDependantMode) {
      familyNo =
        familyNo ||
        principalInformation.familyNo ||
        bioData.familyNo ||
        "";
      if (!familyNo.trim()) {
        setError("Family number is missing from the principal");
        setLoading(false);
        return;
      }

      const dependantUrl = memberId
        ? `/api/medical/members/${encodeURIComponent(principalMemberNo.trim())}/dependants/${encodeURIComponent(memberId)}`
        : `/api/medical/members/${encodeURIComponent(principalMemberNo.trim())}/dependants`;

      const res = await fetch(
        dependantUrl,
        {
          method: memberId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bioData: {
              ...bioData,
              familyNo,
              corpId: bioData.corpId || resolvedCorpId,
            },
            medicalDetails: {
              ...medicalDetails,
              anniv: medicalDetails.anniv || resolvedCorporateAnniv,
            },
            benefits: benefitRows.map((row) => ({
              ...row,
              corpId: row.corpId || resolvedCorpId,
              anniv: row.anniv || resolvedCorporateAnniv,
            })),
            coverHistory: coverHistoryRows.map((row) => ({
              ...row,
              anniv: row.anniv || resolvedCorporateAnniv,
              endDate: corporateEndDate || row.endDate,
              renewalDate: corporateRenewalDate || row.renewalDate,
            })),
            acceptance,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const savedMemberNo = data.memberNo?.trim() || memberId || "";
      applyIdentityNumbers(familyNo, savedMemberNo);

      const saved: SavedMemberSummary = {
        id: savedMemberNo,
        memberNumber: savedMemberNo,
        firstName: bioData.firstName || bioData.surname || "—",
        lastName: bioData.surname || bioData.firstName || "—",
        corporateId,
        phone: bioData.mobileNo || null,
        email: bioData.emailAdd || null,
      };

      if (onSuccess) {
        onSuccess(saved);
      } else {
        router.push("/admin/medical/members?manage=1");
        router.refresh();
      }
      setLoading(false);
      return;
    }

    const url = memberId
      ? `/api/medical/members/${encodeURIComponent(memberId)}`
      : "/api/medical/members";
    const method = memberId ? "PUT" : "POST";

    if (!memberId) {
      try {
        const nextRes = await fetch(
          `/api/medical/members/next-numbers?corpId=${encodeURIComponent(resolvedCorpId)}`,
          { cache: "no-store" }
        );
        if (!nextRes.ok) {
          const data = await nextRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to generate member number");
        }
        const next = (await nextRes.json()) as {
          familyNo: string;
          memberNo: string;
        };
        if (!next.familyNo?.trim() || !next.memberNo?.trim()) {
          throw new Error("Failed to generate member number");
        }
        familyNo = next.familyNo.trim();
        memberNo = next.memberNo.trim();
        applyIdentityNumbers(familyNo, memberNo);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate member number"
        );
        setLoading(false);
        return;
      }
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        principalInformation: {
          ...principalInformation,
          corpId: resolvedCorpId,
          branch: /^\d+$/.test(principalInformation.branch || corporateBranch)
            ? principalInformation.branch || corporateBranch
            : "",
          familySize: principalInformation.familySize || "1",
          familyNo,
          memberNo,
        },
        bioData: {
          ...bioData,
          memberNo,
          familyNo,
          corpId: bioData.corpId || resolvedCorpId,
          relationToPrincipal: bioData.relationToPrincipal || "1",
          familyTitle: bioData.familyTitle || "1",
        },
        medicalDetails: {
          ...medicalDetails,
          memberNo,
          anniv: medicalDetails.anniv || resolvedCorporateAnniv,
        },
        benefits: benefitRows.map((row) => ({
          ...row,
          memberNo,
          corpId: row.corpId || resolvedCorpId,
          anniv: row.anniv || resolvedCorporateAnniv,
        })),
        coverHistory: coverHistoryRows.map((row) => ({
          ...row,
          memberNo,
          anniv: row.anniv || resolvedCorporateAnniv,
          endDate: corporateEndDate || row.endDate,
          renewalDate: corporateRenewalDate || row.renewalDate,
        })),
        acceptance: {
          ...acceptance,
          memberNo,
        },
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const data = await res.json();
    const savedMemberNo =
      data.memberNo?.trim() || memberNo || principalInformation.memberNo;

    const saved: SavedMemberSummary = {
      id: savedMemberNo,
      memberNumber: savedMemberNo,
      firstName:
        principalInformation.firstName || principalInformation.surname || "—",
      lastName:
        principalInformation.surname || principalInformation.firstName || "—",
      corporateId,
      phone:
        principalInformation.mobileNo ||
        principalInformation.telNo ||
        null,
      email: principalInformation.email || null,
    };

    if (onSuccess) {
      onSuccess(saved);
    } else {
      router.push("/admin/medical/members?manage=1");
      router.refresh();
    }
  };

  const formClassName = embedded
    ? "flex h-full min-h-0 flex-col"
    : "w-full space-y-6 border border-slate-200 bg-white p-6";

  const activeTabPanel = (() => {
    switch (activeTab) {
      case "principalInformation":
        if (isDependantMode) return null;
        return (
          <PrincipalInformationTab
            value={{
              ...principalInformation,
              branch:
                principalInformation.branch || corporateBranch || "",
            }}
            onChange={handlePrincipalInformationChange}
            agentOptions={agentOptions}
            categoryOptions={categoryOptions}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
            corporateName={corporateName}
            dependants={initialDependants}
            onAddDependant={onAddDependant}
            onEditDependant={onEditDependant}
          />
        );
      case "bioData":
        return (
          <BioDataTab
            value={{
              ...bioData,
              memberNo: resolvedMemberNo,
              familyNo: resolvedFamilyNo || bioData.familyNo,
              corpId:
                bioData.corpId || principalInformation.corpId || corpId,
              relationToPrincipal: isDependantMode
                ? bioData.relationToPrincipal
                : bioData.relationToPrincipal || "1",
              familyTitle: isDependantMode
                ? bioData.familyTitle
                : bioData.familyTitle || "1",
            }}
            onChange={handleBioDataChange}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
            corporateName={corporateName}
            lockPrincipalRelationship={!isDependantMode}
          />
        );
      case "benefits":
        return (
          <BenefitsTab
            rows={benefitRows.map((row) => ({
              ...row,
              memberNo: resolvedMemberNo,
              corpId: row.corpId || principalInformation.corpId || corpId,
            }))}
            benefitOptions={categoryBenefitOptions}
            fieldInputClass={fieldInputClass}
          />
        );
      case "medicalDetails":
        return (
          <MedicalDetailsTab
            value={{
              ...medicalDetails,
              memberNo: resolvedMemberNo,
            }}
            onChange={handleMedicalDetailsChange}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
          />
        );
      case "historyOfCover":
        return (
          <HistoryOfCoverTab
            rows={coverHistoryRows.map((row) => ({
              ...row,
              memberNo: resolvedMemberNo,
              endDate: corporateEndDate || row.endDate,
              renewalDate: corporateRenewalDate || row.renewalDate,
            }))}
            onRowChange={handleCoverHistoryRowChange}
            fieldInputClass={fieldInputClass}
          />
        );
      case "acceptance":
        return (
          <AcceptanceTab
            value={{
              ...acceptance,
              memberNo: resolvedMemberNo,
            }}
            onChange={handleAcceptanceChange}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
          />
        );
      case "miscellaneous":
        return <MiscellaneousTab />;
    }
  })();

  const visibleTabs = isDependantMode
    ? memberDependantTabs
    : memberPrincipalTabs;

  const formBody = (
    <>
      <FormError message={error} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 md:flex-row">
        <div className="flex shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50 p-1 md:block md:w-40 md:overflow-visible md:border-b-0 md:border-r">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`block shrink-0 px-2 py-1 text-left text-[12px] font-medium transition md:w-full ${
                activeTab === tab.id
                  ? "bg-maroon/10 text-maroon"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-2">
          {activeTabPanel}
        </div>
      </div>
    </>
  );

  const submitLabel = isDependantMode
    ? memberId
      ? "Update Dependant"
      : "Create Dependant"
    : memberId
      ? "Update Principal"
      : "Create Principal";

  const formActions = (
    <div
      className={`flex gap-3 ${
        embedded
          ? "shrink-0 justify-center border-t border-slate-200 bg-white pt-1.5"
          : "border-t border-slate-200 pt-4"
      }`}
    >
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
      {onCancel ? (
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      ) : (
        <ButtonLink href="/admin/medical/members?manage=1" variant="secondary" size="sm">
          Cancel
        </ButtonLink>
      )}
    </div>
  );

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="flex min-h-0 flex-1 flex-col space-y-1.5 overflow-hidden p-2">
          {formBody}
        </div>
        {formActions}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {formBody}
      {formActions}
    </form>
  );
}
