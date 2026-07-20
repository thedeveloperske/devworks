"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MemberForm } from "./MemberForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  defaultBioDataForm,
  defaultMedicalDetailsForm,
  defaultMemberAcceptanceForm,
  defaultPrincipalInformationForm,
  createEmptyMemberAnniversaryRow,
  createEmptyMemberBenefitRow,
  type BioDataFormData,
  type FamilyDependantRow,
  type MedicalDetailsFormData,
  type MemberAcceptanceFormData,
  type MemberAnniversaryFormData,
  type MemberBenefitFormData,
  type MemberListItem,
  type MembersCorporateOption,
  type PrincipalInformationFormData,
  type PrincipalOption,
  type SavedMemberSummary,
} from "@/features/medical/members";
import { memberStatusOptions, memberTypeOptions } from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";

type MembersPageClientProps = {
  members: MemberListItem[];
  corporates: MembersCorporateOption[];
  corporateOptions: LookupOption[];
  principalOptions: PrincipalOption[];
  agentOptions: LookupOption[];
  benefitOptions: LookupOption[];
};

type EditMemberState = {
  id: string;
  principalInformation: PrincipalInformationFormData | null;
  bioData: BioDataFormData | null;
  medicalDetails: MedicalDetailsFormData | null;
  benefits: MemberBenefitFormData[];
  coverHistory: MemberAnniversaryFormData[];
  acceptance: MemberAcceptanceFormData | null;
  dependants: FamilyDependantRow[];
  name: string;
  error: string;
};

type DependantEditState = {
  memberNo: string;
  loading: boolean;
  error: string;
  bioData: BioDataFormData | null;
  medicalDetails: MedicalDetailsFormData | null;
  benefits: MemberBenefitFormData[];
  coverHistory: MemberAnniversaryFormData[];
  acceptance: MemberAcceptanceFormData | null;
};

const tableBodyMaxHeight = 280;
const corporatesTableMinWidth = 560;
const membersTableMinWidth = 640;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

function buildMembersManageHref(
  pathname: string,
  options?: { corporateId?: string; newMember?: boolean; editId?: string }
) {
  const params = new URLSearchParams();
  params.set("manage", "1");
  if (options?.corporateId) params.set("corporate", options.corporateId);
  if (options?.newMember) params.set("new", "1");
  if (options?.editId) params.set("edit", options.editId);
  return `${pathname}?${params.toString()}`;
}

export function MembersPageClient({
  members,
  corporates,
  corporateOptions,
  principalOptions,
  agentOptions,
  benefitOptions,
}: MembersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const selectedCorporateId = searchParams.get("corporate") ?? "";
  const manageOpen = searchParams.get("manage") === "1";
  const memberModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || memberModalOpen;
  const hasOpenedManageRef = useRef(false);

  const [editState, setEditState] = useState<EditMemberState | null>(null);
  const [addingDependant, setAddingDependant] = useState(false);
  const [editingDependant, setEditingDependant] =
    useState<DependantEditState | null>(null);
  const [actionError, setActionError] = useState("");
  const [membersList, setMembersList] = useState(members);
  const [corporateSearchQuery, setCorporateSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  useEffect(() => {
    setMembersList(members);
  }, [members]);

  const memberTypeLabelById = useMemo(
    () =>
      Object.fromEntries(
        memberTypeOptions.map((option) => [option.value, option.label])
      ),
    []
  );

  const memberStatusLabelById = useMemo(
    () =>
      Object.fromEntries(
        memberStatusOptions.map((option) => [option.value, option.label])
      ),
    []
  );

  const memberCountByCorporateId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of membersList) {
      counts[member.corporateId] = (counts[member.corporateId] ?? 0) + 1;
    }
    return counts;
  }, [membersList]);

  const filteredCorporates = useMemo(() => {
    const query = corporateSearchQuery.trim().toLowerCase();
    if (!query) return corporates;

    return corporates.filter((corporate) =>
      [corporate.corporate, corporate.corpId, corporate.policyNo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [corporateSearchQuery, corporates]);

  const selectedCorporate = useMemo(
    () => corporates.find((corporate) => corporate.id === selectedCorporateId),
    [corporates, selectedCorporateId]
  );

  const filteredMembers = useMemo(() => {
    if (!selectedCorporateId) return [];
    const corporateMembers = membersList.filter(
      (member) => member.corporateId === selectedCorporateId
    );
    const query = memberSearchQuery.trim().toLowerCase();
    if (!query) return corporateMembers;

    return corporateMembers.filter((member) =>
      [
        member.memberNumber,
        member.firstName,
        member.lastName,
        `${member.firstName} ${member.lastName}`,
        memberTypeLabelById[member.memberType] ?? member.memberType,
        memberStatusLabelById[member.status] ?? member.status,
        member.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [
    memberSearchQuery,
    memberStatusLabelById,
    memberTypeLabelById,
    membersList,
    selectedCorporateId,
  ]);

  const closeManageModal = useCallback(() => {
    setCorporateSearchQuery("");
    setMemberSearchQuery("");
    router.replace("/admin/medical");
  }, [router]);

  const closeMemberModal = useCallback(() => {
    setEditState(null);
    setAddingDependant(false);
    setEditingDependant(null);
    setActionError("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("edit");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const openNewModal = useCallback(() => {
    router.push(
      buildMembersManageHref(pathname, {
        corporateId: selectedCorporateId || undefined,
        newMember: true,
      }),
      { scroll: false }
    );
  }, [pathname, router, selectedCorporateId]);

  const handleSaved = useCallback(
    (saved: SavedMemberSummary) => {
      const corporateName =
        corporates.find((corporate) => corporate.id === saved.corporateId)
          ?.corporate ?? "—";

      setMembersList((prev) => {
        const nextItem: MemberListItem = {
          id: saved.id,
          memberNumber: saved.memberNumber,
          firstName: saved.firstName,
          lastName: saved.lastName,
          corporateId: saved.corporateId,
          corporateName,
          memberType: "PRINCIPAL",
          status: "ACTIVE",
          phone: saved.phone,
          email: saved.email,
        };

        const index = prev.findIndex(
          (member) =>
            member.id === saved.id || member.memberNumber === saved.memberNumber
        );
        if (index === -1) {
          return [...prev, nextItem];
        }

        return prev.map((member, memberIndex) =>
          memberIndex === index ? { ...member, ...nextItem } : member
        );
      });

      setEditState(null);
      setAddingDependant(false);
      closeMemberModal();
    },
    [closeMemberModal, corporates]
  );

  const handleDependantSaved = useCallback(
    async (_saved: SavedMemberSummary) => {
      setAddingDependant(false);
      setEditingDependant(null);
      if (!editId) return;

      try {
        const res = await fetch(
          `/api/medical/members/${encodeURIComponent(editId)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const member = await res.json();
          setEditState((prev) => {
            if (!prev || prev.id !== editId) return prev;
            return {
              ...prev,
              dependants: Array.isArray(member.dependants)
                ? member.dependants
                : prev.dependants,
              principalInformation:
                member.principalInformation ?? prev.principalInformation,
            };
          });
        }
      } catch {
        // Keep local state; list still updates when the principal is reopened.
      }

      router.refresh();
    },
    [editId, router]
  );

  const startAddDependant = useCallback(() => {
    const principal = editState?.principalInformation;
    if (editState?.bioData?.cancelled?.trim() === "1") {
      setActionError(
        "This principal is cancelled. Reinstate them before adding dependants."
      );
      return;
    }
    if (!principal?.category?.trim()) {
      setActionError(
        "Set a category on the principal before adding dependants"
      );
      return;
    }
    if (!principal.familyNo?.trim()) {
      setActionError(
        "Principal family number is required before adding dependants"
      );
      return;
    }
    setActionError("");
    setAddingDependant(true);
  }, [editState?.bioData?.cancelled, editState?.principalInformation]);

  const startEditDependant = useCallback(
    (memberNo: string) => {
      if (!editId) return;
      setActionError("");
      setEditingDependant({
        memberNo,
        loading: true,
        error: "",
        bioData: null,
        medicalDetails: null,
        benefits: [],
        coverHistory: [],
        acceptance: null,
      });

      fetch(
        `/api/medical/members/${encodeURIComponent(editId)}/dependants/${encodeURIComponent(memberNo)}`,
        { cache: "no-store" }
      )
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? "Failed to load dependant");
          }
          return res.json();
        })
        .then((dependant) => {
          setEditingDependant((prev) => {
            if (!prev || prev.memberNo !== memberNo) return prev;
            return {
              memberNo,
              loading: false,
              error: "",
              bioData: dependant.bioData ?? null,
              medicalDetails: dependant.medicalDetails ?? null,
              benefits: Array.isArray(dependant.benefits)
                ? dependant.benefits
                : [],
              coverHistory: Array.isArray(dependant.coverHistory)
                ? dependant.coverHistory
                : [],
              acceptance: dependant.acceptance ?? null,
            };
          });
        })
        .catch((error: unknown) => {
          setEditingDependant((prev) => {
            if (!prev || prev.memberNo !== memberNo) return prev;
            return {
              ...prev,
              loading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load dependant",
            };
          });
        });
    },
    [editId]
  );

  useEffect(() => {
    setMemberSearchQuery("");
  }, [selectedCorporateId]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") {
      hasOpenedManageRef.current = true;
      return;
    }

    // First visit without manage: open management.
    // After management was open, bare /members means browser Back — leave the flow.
    if (!hasOpenedManageRef.current) {
      hasOpenedManageRef.current = true;
      router.replace(`${pathname}?manage=1`, { scroll: false });
      return;
    }

    router.replace("/admin/medical");
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editId) {
      setEditState(null);
      setAddingDependant(false);
      setEditingDependant(null);
      return;
    }

    let cancelled = false;
    setEditState(null);
    setAddingDependant(false);
    setEditingDependant(null);
    setActionError("");

    fetch(`/api/medical/members/${encodeURIComponent(editId)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load member");
        }
        return res.json();
      })
      .then((member) => {
        if (cancelled) return;
        const memberNo = member.memberNumber ?? member.id ?? "";
        setEditState({
          id: editId,
          principalInformation:
            member.principalInformation ??
            ({
              ...defaultPrincipalInformationForm,
              memberNo,
              firstName: member.firstName ?? "",
              surname: member.lastName ?? "",
              email: member.email ?? "",
              mobileNo: member.phone ?? "",
              corpId: member.corporate?.corpId ?? "",
            } satisfies PrincipalInformationFormData),
          medicalDetails:
            member.medicalDetails ??
            ({
              ...defaultMedicalDetailsForm,
              memberNo,
            } satisfies MedicalDetailsFormData),
          bioData:
            member.bioData ??
            ({
              ...defaultBioDataForm,
              memberNo,
              familyNo: member.principalInformation?.familyNo ?? "",
              corpId: member.corporate?.corpId ?? "",
              surname: member.lastName ?? "",
              firstName: member.firstName ?? "",
              mobileNo: member.phone ?? "",
              emailAdd: member.email ?? "",
            } satisfies BioDataFormData),
          benefits: Array.isArray(member.benefits) ? member.benefits : [],
          coverHistory: Array.isArray(member.coverHistory)
            ? member.coverHistory
            : [],
          acceptance:
            member.acceptance ??
            ({
              ...defaultMemberAcceptanceForm,
              memberNo,
            } satisfies MemberAcceptanceFormData),
          dependants: Array.isArray(member.dependants) ? member.dependants : [],
          name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          principalInformation: null,
          bioData: null,
          medicalDetails: null,
          benefits: [],
          coverHistory: [],
          acceptance: null,
          dependants: [],
          name: "",
          error:
            error instanceof Error ? error.message : "Failed to load member",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editPrincipalInformation =
    editState?.id === editId ? editState.principalInformation : null;
  const editBioData = editState?.id === editId ? editState.bioData : null;
  const editMedicalDetails =
    editState?.id === editId ? editState.medicalDetails : null;
  const editBenefits = editState?.id === editId ? editState.benefits : [];
  const editCoverHistory =
    editState?.id === editId ? editState.coverHistory : [];
  const editAcceptance =
    editState?.id === editId ? editState.acceptance : null;
  const editDependants =
    editState?.id === editId ? editState.dependants : [];
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingMember = editId
    ? membersList.find((member) => member.id === editId)
    : undefined;

  const formCategoryOptions = useMemo(() => {
    const corporateId =
      editingMember?.corporateId || selectedCorporateId || "";
    const corporate = corporates.find((item) => item.id === corporateId);
    return corporate?.categoryOptions ?? selectedCorporate?.categoryOptions ?? [];
  }, [
    corporates,
    editingMember?.corporateId,
    selectedCorporate?.categoryOptions,
    selectedCorporateId,
  ]);

  const corporatesTable = (
    <section className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="flex shrink-0 items-center justify-end">
        <input
          type="text"
          value={corporateSearchQuery}
          onChange={(e) => setCorporateSearchQuery(e.target.value)}
          placeholder="Search..."
          aria-label="Search corporates"
          className={searchInputClass}
        />
      </div>
      <div
        className="min-h-0 overflow-x-auto overflow-y-scroll border border-slate-200"
        style={{ height: tableBodyMaxHeight }}
      >
        <table
          className="w-full border-collapse"
          style={{ minWidth: corporatesTableMinWidth }}
        >
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className={thClass}>Corporate</th>
              <th className={thClass}>Corp ID</th>
              <th className={thClass}>Policy No</th>
              <th className={thClass}>Members</th>
            </tr>
          </thead>
          <tbody>
            {filteredCorporates.length === 0 ? (
              <tr>
                <td colSpan={4} className={emptyCellClass}>
                  {corporates.length === 0
                    ? "No corporates found."
                    : "No corporates match your search."}
                </td>
              </tr>
            ) : (
              filteredCorporates.map((corporate) => (
                <tr key={corporate.id} className="bg-white hover:bg-slate-50">
                  <td className={tdClass}>
                    <Link
                      href={buildMembersManageHref(pathname, {
                        corporateId: corporate.id,
                      })}
                      scroll={false}
                      className="font-semibold text-maroon hover:underline"
                    >
                      {corporate.corporate}
                    </Link>
                  </td>
                  <td className={tdClass}>{corporate.corpId ?? "—"}</td>
                  <td className={tdClass}>{corporate.policyNo ?? "—"}</td>
                  <td className={tdClass}>
                    {memberCountByCorporateId[corporate.id] ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const membersTable = (
    <section className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] text-slate-600">
          {selectedCorporate?.corporate ?? "Members"}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="text"
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search members"
            className={searchInputClass}
          />
          <Button type="button" size="sm" onClick={openNewModal}>
            Add Principal
          </Button>
        </div>
      </div>
      <div
        className="min-h-0 overflow-x-auto overflow-y-scroll border border-slate-200"
        style={{ height: tableBodyMaxHeight }}
      >
        <table
          className="w-full border-collapse"
          style={{ minWidth: membersTableMinWidth }}
        >
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className={thClass}>Member No</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className={emptyCellClass}>
                  {membersList.some(
                    (member) => member.corporateId === selectedCorporateId
                  )
                    ? "No members match your search."
                    : (
                      <>
                        No members found.{" "}
                        <button
                          type="button"
                          onClick={openNewModal}
                          className="text-maroon hover:underline"
                        >
                          Create one
                        </button>
                      </>
                    )}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="bg-white hover:bg-slate-50">
                  <td className={tdClass}>{member.memberNumber}</td>
                  <td className={tdClass}>
                    <Link
                      href={buildMembersManageHref(pathname, {
                        corporateId: selectedCorporateId || undefined,
                        editId: member.id,
                      })}
                      scroll={false}
                      className="font-semibold text-maroon hover:underline"
                    >
                      {member.firstName} {member.lastName}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    {memberTypeLabelById[member.memberType] ?? member.memberType}
                  </td>
                  <td className={tdClass}>
                    {memberStatusLabelById[member.status] ?? member.status}
                  </td>
                  <td className={tdClass}>{member.phone ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className={`relative ${modalOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={modalOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="Members"
          description="Open Manage Members from the menu to view and edit member records"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Manage Members"
        description="Manage member records and their details"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {selectedCorporateId ? membersTable : corporatesTable}
        </div>
      </Modal>

      <Modal
        open={memberModalOpen}
        onClose={closeMemberModal}
        title={
          editingDependant
            ? "Edit Dependant"
            : addingDependant
              ? "New Dependant"
              : isNew
                ? "New Principal"
                : "Edit Principal"
        }
        description={
          editingDependant
            ? editingDependant.memberNo
            : addingDependant
              ? "Register a dependant for this principal"
              : isNew
                ? "Register a new principal member"
                : editName ||
                  (editingMember
                    ? `${editingMember.firstName} ${editingMember.lastName}`
                    : "Update principal details")
        }
      >
        {editingDependant && editId && editPrincipalInformation ? (
          editingDependant.loading ? (
            <p className="text-[12px] text-slate-500">Loading dependant...</p>
          ) : editingDependant.error ? (
            <div className="space-y-2">
              <p className="text-[12px] text-red-600">
                {editingDependant.error}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingDependant(null)}
              >
                Back
              </Button>
            </div>
          ) : (
            <MemberForm
              key={`dependant-edit-${editingDependant.memberNo}`}
              mode="dependant"
              memberId={editingDependant.memberNo}
              principalMemberNo={editId}
              embedded
              corporateId={
                editingMember?.corporateId || selectedCorporateId || ""
              }
              corpId={
                editPrincipalInformation.corpId ||
                selectedCorporate?.corpId ||
                ""
              }
              corporateName={
                selectedCorporate?.corporate ||
                editingMember?.corporateName ||
                ""
              }
              corporateBranch={selectedCorporate?.branch ?? ""}
              corporateEndDate={selectedCorporate?.endDate ?? ""}
              corporateRenewalDate={selectedCorporate?.renewalDate ?? ""}
              corporateAnniv={selectedCorporate?.anniv ?? ""}
              initialPrincipalInformation={{
                ...editPrincipalInformation,
                memberNo: editingDependant.memberNo,
              }}
              initialBioData={
                editingDependant.bioData ?? {
                  ...defaultBioDataForm,
                  memberNo: editingDependant.memberNo,
                  familyNo: editPrincipalInformation.familyNo,
                  corpId:
                    editPrincipalInformation.corpId ||
                    selectedCorporate?.corpId ||
                    "",
                }
              }
              initialMedicalDetails={
                editingDependant.medicalDetails ?? {
                  ...defaultMedicalDetailsForm,
                  memberNo: editingDependant.memberNo,
                  anniv: selectedCorporate?.anniv || "1",
                }
              }
              initialBenefits={editingDependant.benefits}
              initialCoverHistory={editingDependant.coverHistory}
              initialAcceptance={
                editingDependant.acceptance ?? {
                  ...defaultMemberAcceptanceForm,
                  memberNo: editingDependant.memberNo,
                }
              }
              agentOptions={agentOptions}
              benefitOptions={benefitOptions}
              corpGroupBenefits={selectedCorporate?.corpGroupBenefits ?? []}
              categoryOptions={formCategoryOptions}
              corporateOptions={corporateOptions}
              principalOptions={principalOptions}
              onSuccess={handleDependantSaved}
              onCancel={() => setEditingDependant(null)}
            />
          )
        ) : addingDependant && editId && editPrincipalInformation ? (
          <MemberForm
            key={`dependant-${editId}`}
            mode="dependant"
            principalMemberNo={editId}
            embedded
            corporateId={
              editingMember?.corporateId || selectedCorporateId || ""
            }
            corpId={
              editPrincipalInformation.corpId ||
              selectedCorporate?.corpId ||
              ""
            }
            corporateName={
              selectedCorporate?.corporate ||
              editingMember?.corporateName ||
              ""
            }
            corporateBranch={selectedCorporate?.branch ?? ""}
            corporateEndDate={selectedCorporate?.endDate ?? ""}
            corporateRenewalDate={selectedCorporate?.renewalDate ?? ""}
            corporateAnniv={selectedCorporate?.anniv ?? ""}
            initialPrincipalInformation={{
              ...editPrincipalInformation,
              memberNo: "",
              familySize: editPrincipalInformation.familySize || "1",
            }}
            initialBioData={{
              ...defaultBioDataForm,
              familyNo: editPrincipalInformation.familyNo,
              corpId:
                editPrincipalInformation.corpId ||
                selectedCorporate?.corpId ||
                "",
              relationToPrincipal: "",
              familyTitle: "",
            }}
            initialMedicalDetails={{
              ...defaultMedicalDetailsForm,
              anniv: selectedCorporate?.anniv || "1",
            }}
            initialBenefits={(
              selectedCorporate?.corpGroupBenefits ?? []
            )
              .filter(
                (row) =>
                  row.category === editPrincipalInformation.category &&
                  (!selectedCorporate?.anniv ||
                    row.anniv === selectedCorporate.anniv)
              )
              .map((row) =>
                createEmptyMemberBenefitRow({
                  corpId:
                    editPrincipalInformation.corpId ||
                    selectedCorporate?.corpId ||
                    "",
                  benefit: row.benefit,
                  anniv: row.anniv || selectedCorporate?.anniv || "1",
                  policyLimit: row.policyLimit,
                  sharing: row.sharing,
                  subLimitOf: row.subLimitOf,
                  waitingPeriod: row.waitingPeriod,
                })
              )}
            initialCoverHistory={[
              createEmptyMemberAnniversaryRow({
                anniv: selectedCorporate?.anniv || "1",
                endDate: selectedCorporate?.endDate ?? "",
                renewalDate: selectedCorporate?.renewalDate ?? "",
              }),
            ]}
            initialAcceptance={defaultMemberAcceptanceForm}
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            corpGroupBenefits={selectedCorporate?.corpGroupBenefits ?? []}
            categoryOptions={formCategoryOptions}
            corporateOptions={corporateOptions}
            principalOptions={principalOptions}
            onSuccess={handleDependantSaved}
            onCancel={() => setAddingDependant(false)}
          />
        ) : isNew ? (
          <MemberForm
            key={`new-${selectedCorporateId || "none"}`}
            embedded
            corporateId={selectedCorporateId}
            corpId={selectedCorporate?.corpId ?? ""}
            corporateName={selectedCorporate?.corporate ?? ""}
            corporateBranch={selectedCorporate?.branch ?? ""}
            corporateEndDate={selectedCorporate?.endDate ?? ""}
            corporateRenewalDate={selectedCorporate?.renewalDate ?? ""}
            corporateAnniv={selectedCorporate?.anniv ?? ""}
            initialPrincipalInformation={{
              corpId: selectedCorporate?.corpId ?? "",
              branch: selectedCorporate?.branch ?? "",
              businessClass: selectedCorporate?.businessClass ?? "",
              agentId: selectedCorporate?.agentId ?? "",
              policyNo: selectedCorporate?.policyNo ?? "",
              familySize: "1",
            }}
            initialBioData={{
              ...defaultBioDataForm,
              corpId: selectedCorporate?.corpId ?? "",
            }}
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            corpGroupBenefits={selectedCorporate?.corpGroupBenefits ?? []}
            categoryOptions={formCategoryOptions}
            corporateOptions={corporateOptions}
            principalOptions={principalOptions}
            onSuccess={handleSaved}
            onCancel={closeMemberModal}
          />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading member...</p>
        ) : editError && !editPrincipalInformation ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editPrincipalInformation && editId ? (
          <>
            {actionError ? (
              <p className="mb-1.5 text-[12px] text-red-600">{actionError}</p>
            ) : null}
            <MemberForm
            key={editId}
            embedded
            memberId={editId}
            corporateId={
              editingMember?.corporateId || selectedCorporateId || ""
            }
            corpId={
              editPrincipalInformation.corpId ||
              selectedCorporate?.corpId ||
              ""
            }
            corporateName={
              selectedCorporate?.corporate ||
              editingMember?.corporateName ||
              ""
            }
            corporateBranch={selectedCorporate?.branch ?? ""}
            corporateEndDate={selectedCorporate?.endDate ?? ""}
            corporateRenewalDate={selectedCorporate?.renewalDate ?? ""}
            corporateAnniv={selectedCorporate?.anniv ?? ""}
            initialPrincipalInformation={{
              ...editPrincipalInformation,
              businessClass:
                selectedCorporate?.businessClass ??
                editPrincipalInformation.businessClass ??
                "",
              policyNo:
                editPrincipalInformation.policyNo ||
                selectedCorporate?.policyNo ||
                "",
              branch:
                selectedCorporate?.branch ??
                editPrincipalInformation.branch ??
                "",
              agentId:
                selectedCorporate?.agentId ??
                editPrincipalInformation.agentId ??
                "",
            }}
            initialBioData={
              editBioData ?? {
                ...defaultBioDataForm,
                memberNo: editPrincipalInformation.memberNo,
                familyNo: editPrincipalInformation.familyNo,
                corpId: editPrincipalInformation.corpId,
                surname: editPrincipalInformation.surname,
                firstName: editPrincipalInformation.firstName,
                otherNames: editPrincipalInformation.otherNames,
                mobileNo: editPrincipalInformation.mobileNo,
                emailAdd: editPrincipalInformation.email,
              }
            }
            initialMedicalDetails={
              editMedicalDetails ?? {
                ...defaultMedicalDetailsForm,
                memberNo: editPrincipalInformation.memberNo,
                anniv: selectedCorporate?.anniv || "1",
              }
            }
            initialBenefits={editBenefits}
            initialCoverHistory={editCoverHistory}
            initialAcceptance={
              editAcceptance ?? {
                ...defaultMemberAcceptanceForm,
                memberNo: editPrincipalInformation.memberNo,
              }
            }
            initialDependants={editDependants}
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            corpGroupBenefits={selectedCorporate?.corpGroupBenefits ?? []}
            categoryOptions={formCategoryOptions}
            corporateOptions={corporateOptions}
            principalOptions={principalOptions}
            onSuccess={handleSaved}
            onCancel={closeMemberModal}
            onAddDependant={startAddDependant}
            onEditDependant={startEditDependant}
          />
          </>
        ) : null}
      </Modal>
    </div>
  );
}
