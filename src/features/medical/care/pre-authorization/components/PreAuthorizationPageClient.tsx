"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  preAuthorizationToFormValues,
  type PreAuthorizationCorporateOption,
  type PreAuthorizationFormData,
  type PreAuthorizationListItem,
  type PreAuthorizationMemberOption,
} from "@/features/medical/care/pre-authorization";
import type { LookupOption } from "@/features/medical/lookups/types";
import { formatDate } from "@/lib/format";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";
import { PreAuthorizationActionsMenu } from "./PreAuthorizationActionsMenu";
import type { PreAuthorizationAction } from "./PreAuthorizationActionsMenu";
import { PreAuthorizationForm } from "./PreAuthorizationForm";
import { PreAuthorizationReserveModal } from "./PreAuthorizationReserveModal";

type PreAuthorizationPageClientProps = {
  preAuthorizations: PreAuthorizationListItem[];
  corporates: PreAuthorizationCorporateOption[];
  members: PreAuthorizationMemberOption[];
  providerOptions: LookupOption[];
  hospitalWardOptions: LookupOption[];
};

type EditState = {
  id: string;
  form: PreAuthorizationFormData | null;
  label: string;
  error: string;
};

const compactThClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500";
const compactTdClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[11px] text-slate-600";
const compactEmptyCellClass =
  "px-2.5 py-4 text-center text-[11px] text-slate-500";
const searchInputClass =
  "w-40 border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

function resolvePreauthSubjectName(args: {
  memberNo: string;
  memberName?: string | null;
  members: PreAuthorizationMemberOption[];
  corporates: PreAuthorizationCorporateOption[];
}) {
  const listedName = args.memberName?.trim();
  if (listedName) return listedName;

  const member = args.members.find((row) => row.memberNo === args.memberNo);
  const memberName = member?.name?.trim();
  if (memberName && memberName !== "—") return memberName;

  const corporate = args.corporates.find(
    (row) => row.id === member?.corporateId
  );
  const corporateName = corporate?.corporate?.trim();
  return corporateName || null;
}

function formatPreauthNumberLabel(
  code: number | string,
  subjectName: string | null | undefined
) {
  const base = `Preauth Ref #${code}`;
  const subject = subjectName?.trim();
  return subject ? `${base} for ${subject}` : base;
}

export function PreAuthorizationPageClient({
  preAuthorizations,
  corporates,
  members,
  providerOptions,
  hospitalWardOptions,
}: PreAuthorizationPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const manageOpen = searchParams.get("manage") === "1";
  const selectedCorporateId = searchParams.get("corporate") ?? "";
  const selectedMemberNo = searchParams.get("member") ?? "";
  const formModalOpen = isNew || Boolean(editId) || Boolean(viewId);
  const modalOpen = manageOpen || formModalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [corporateSearchQuery, setCorporateSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [editState, setEditState] = useState<EditState | null>(null);
  const [reserveAction, setReserveAction] = useState<{
    mode: "top-up" | "release";
    row: PreAuthorizationListItem;
  } | null>(null);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  const selectedCorporate = useMemo(
    () => corporates.find((corporate) => corporate.id === selectedCorporateId),
    [corporates, selectedCorporateId]
  );

  const selectedMember = useMemo(
    () => members.find((member) => member.memberNo === selectedMemberNo),
    [members, selectedMemberNo]
  );

  const memberCountByCorporateId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of members) {
      if (!member.corporateId) continue;
      counts[member.corporateId] = (counts[member.corporateId] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return preAuthorizations;

    return preAuthorizations.filter((row) =>
      [
        row.code,
        row.memberNo,
        row.memberName,
        row.provider,
        row.providerName,
        row.reportedBy,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [preAuthorizations, searchQuery]);

  const filteredCorporates = useMemo(() => {
    const query = corporateSearchQuery.trim().toLowerCase();
    if (!query) return corporates;
    return corporates.filter((corporate) =>
      [corporate.corporate, corporate.corpId, corporate.policyNo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [corporateSearchQuery, corporates]);

  const corporateMembers = useMemo(() => {
    if (!selectedCorporateId) return [];
    return members.filter(
      (member) =>
        member.corporateId === selectedCorporateId && member.cancelled !== 1
    );
  }, [members, selectedCorporateId]);

  const filteredMembers = useMemo(() => {
    const query = memberSearchQuery.trim().toLowerCase();
    if (!query) return corporateMembers;
    return corporateMembers.filter((member) =>
      [member.memberNo, member.name, member.familyNo, member.memberType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [corporateMembers, memberSearchQuery]);

  const newFlowStep = !isNew
    ? null
    : selectedMemberNo
      ? "form"
      : selectedCorporateId
        ? "members"
        : "corporates";

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeFormModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("edit");
    params.delete("view");
    params.delete("corporate");
    params.delete("member");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const openNewModal = useCallback(() => {
    setCorporateSearchQuery("");
    setMemberSearchQuery("");
    router.push(`${pathname}?manage=1&new=1`, { scroll: false });
  }, [pathname, router]);

  const openMembersStep = useCallback(
    (corporateId: string) => {
      setMemberSearchQuery("");
      router.push(
        `${pathname}?manage=1&new=1&corporate=${encodeURIComponent(corporateId)}`,
        { scroll: false }
      );
    },
    [pathname, router]
  );

  const openFormStep = useCallback(
    (corporateId: string, memberNo: string) => {
      router.push(
        `${pathname}?manage=1&new=1&corporate=${encodeURIComponent(corporateId)}&member=${encodeURIComponent(memberNo)}`,
        { scroll: false }
      );
    },
    [pathname, router]
  );

  const openViewModal = useCallback(
    (id: string) => {
      router.push(`${pathname}?manage=1&view=${id}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleSaved = useCallback(() => {
    closeFormModal();
    router.refresh();
  }, [closeFormModal, router]);

  const handleAction = useCallback(
    (action: PreAuthorizationAction, row: PreAuthorizationListItem) => {
      if (action === "view") {
        openViewModal(row.id);
        return;
      }
      if (action === "print") {
        const subjectName = resolvePreauthSubjectName({
          memberNo: row.memberNo,
          memberName: row.memberName,
          members,
          corporates,
        });
        setPrintNotice(
          `Print for ${formatPreauthNumberLabel(row.code, subjectName)} will be available once the template is provided.`
        );
        return;
      }
      if (action === "top-up" || action === "release") {
        setReserveAction({ mode: action, row });
      }
    },
    [corporates, members, openViewModal]
  );
  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const detailId = editId ?? viewId;
    if (!detailId) return;

    let cancelled = false;

    fetch(`/api/medical/care/pre-authorization/${detailId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load pre-authorization");
        }
        return res.json();
      })
      .then((row) => {
        if (cancelled) return;
        const listed = preAuthorizations.find(
          (item) => String(item.code) === String(row.code)
        );
        const subjectName = resolvePreauthSubjectName({
          memberNo: row.memberNo,
          memberName: listed?.memberName,
          members,
          corporates,
        });
        setEditState({
          id: detailId,
          form: preAuthorizationToFormValues(row),
          label: formatPreauthNumberLabel(row.code, subjectName),
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: detailId,
          form: null,
          label: "",
          error:
            error instanceof Error
              ? error.message
              : "Failed to load pre-authorization",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [corporates, editId, members, preAuthorizations, viewId]);

  const detailId = editId ?? viewId;
  const isViewMode = Boolean(viewId) && !editId && !isNew;
  const editLoading = Boolean(detailId && editState?.id !== detailId);
  const editForm = editState?.id === detailId ? editState.form : null;
  const editLabel = editState?.id === detailId ? editState.label : "";
  const editError = editState?.id === detailId ? editState.error : "";
  const editingRow = detailId
    ? preAuthorizations.find((row) => row.id === detailId)
    : undefined;
  const editingSubjectName = editingRow
    ? resolvePreauthSubjectName({
        memberNo: editingRow.memberNo,
        memberName: editingRow.memberName,
        members,
        corporates,
      })
    : null;

  const rowsTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Preauth Ref</th>
            <th className={compactThClass}>Member No</th>
            <th className={compactThClass}>Member Name</th>
            <th className={compactThClass}>Provider</th>
            <th className={compactThClass}>Date Reported</th>
            <th className={`${compactThClass} w-10 text-right`}> </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={6} className={compactEmptyCellClass}>
                {preAuthorizations.length === 0 ? (
                  <>
                    No pre-authorizations found.{" "}
                    <button
                      type="button"
                      onClick={openNewModal}
                      className="text-maroon hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  "No pre-authorizations match your search."
                )}
              </td>
            </tr>
          ) : (
            filteredRows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>{row.code}</td>
                <td className={compactTdClass}>{row.memberNo}</td>
                <td className={compactTdClass}>{row.memberName ?? "—"}</td>
                <td className={compactTdClass}>
                  {row.providerName || row.provider || "—"}
                </td>
                <td className={compactTdClass}>
                  {row.dateReported ? formatDate(row.dateReported) : "—"}
                </td>
                <td className={`${compactTdClass} text-right`}>
                  <PreAuthorizationActionsMenu
                    row={row}
                    onAction={handleAction}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const corporatesStep = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-600">
          Select a corporate to continue
        </p>
        <input
          type="search"
          value={corporateSearchQuery}
          onChange={(e) => setCorporateSearchQuery(e.target.value)}
          placeholder="Search corporates..."
          aria-label="Search corporates"
          className={`${searchInputClass} w-full sm:w-40`}
        />
      </div>
      <div className={`${tableWrapperClass} min-h-0 flex-1 overflow-auto`}>
        <table className={tableClass}>
          <thead className={tableHeadClass}>
            <tr>
              <th className={compactThClass}>Corporate</th>
              <th className={compactThClass}>Corp ID</th>
              <th className={compactThClass}>Policy No</th>
              <th className={compactThClass}>Members</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCorporates.length === 0 ? (
              <tr>
                <td colSpan={4} className={compactEmptyCellClass}>
                  {corporates.length === 0
                    ? "No corporates found."
                    : "No corporates match your search."}
                </td>
              </tr>
            ) : (
              filteredCorporates.map((corporate) => (
                <tr
                  key={corporate.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className={compactTdClass}>
                    <button
                      type="button"
                      onClick={() => openMembersStep(corporate.id)}
                      className="text-left font-semibold text-maroon hover:underline"
                    >
                      {corporate.corporate}
                    </button>
                  </td>
                  <td className={compactTdClass}>{corporate.corpId ?? "—"}</td>
                  <td className={compactTdClass}>
                    {corporate.policyNo ?? "—"}
                  </td>
                  <td className={compactTdClass}>
                    {memberCountByCorporateId[corporate.id] ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const membersStep = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-end gap-2">
        <input
          type="search"
          value={memberSearchQuery}
          onChange={(e) => setMemberSearchQuery(e.target.value)}
          placeholder="Search members..."
          aria-label="Search members"
          className={`${searchInputClass} w-full sm:w-40`}
        />
      </div>
      <div className={`${tableWrapperClass} min-h-0 flex-1 overflow-auto`}>
        <table className={tableClass}>
          <thead className={tableHeadClass}>
            <tr>
              <th className={compactThClass}>Member No</th>
              <th className={compactThClass}>Name</th>
              <th className={compactThClass}>Type</th>
              <th className={compactThClass}>Family No</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className={compactEmptyCellClass}>
                  {corporateMembers.length === 0
                    ? "No members found for this corporate."
                    : "No members match your search."}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr
                  key={member.memberNo}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className={compactTdClass}>
                    <button
                      type="button"
                      onClick={() =>
                        openFormStep(selectedCorporateId, member.memberNo)
                      }
                      className="text-left font-semibold text-maroon hover:underline"
                    >
                      {member.memberNo}
                    </button>
                  </td>
                  <td className={compactTdClass}>{member.name}</td>
                  <td className={compactTdClass}>{member.memberType}</td>
                  <td className={compactTdClass}>{member.familyNo || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const formStep = selectedMember ? (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PreAuthorizationForm
        key={selectedMember.memberNo}
        embedded
        lockMemberNo
        initial={{
          memberNo: selectedMember.memberNo,
          anniv: selectedMember.anniv,
        }}
        memberBenefits={selectedMember.benefits}
        coverPeriods={selectedMember.coverPeriods}
        providerOptions={providerOptions}
        hospitalWardOptions={hospitalWardOptions}
        onSuccess={handleSaved}
        onCancel={closeFormModal}
      />
    </div>
  ) : (
    <p className="text-[11px] text-red-600">Selected member was not found.</p>
  );

  const newModalTitle =
    newFlowStep === "corporates"
      ? "Select Corporate"
      : newFlowStep === "members"
        ? "Select Member"
        : "New Pre-authorization";

  const newModalDescription =
    newFlowStep === "corporates"
      ? "Choose the corporate whose member needs pre-authorization"
      : newFlowStep === "members"
        ? selectedCorporate?.corporate
          ? `Choose a member under ${selectedCorporate.corporate}`
          : "Choose a member"
        : selectedMember
          ? `${selectedMember.name} (${selectedMember.memberNo})`
          : "Create a new care pre-authorization";

  return (
    <div className={`relative ${modalOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={modalOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="Pre-authorization"
          description="Open Pre-authorization from Care to view and manage authorizations"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Pre-authorization"
        description="Manage care pre-authorizations"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search pre-authorizations"
              className={searchInputClass}
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Pre-authorization
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{rowsTable}</div>
        </div>
      </Modal>

      <Modal
        open={formModalOpen}
        onClose={closeFormModal}
        title={
          isNew
            ? newModalTitle
            : isViewMode
              ? "View Pre-authorization"
              : "Edit Pre-authorization"
        }
        description={
          isNew
            ? newModalDescription
            : editLabel ||
              (editingRow
                ? formatPreauthNumberLabel(editingRow.code, editingSubjectName)
                : isViewMode
                  ? "Pre-authorization details"
                  : "Update pre-authorization details")
        }
        size="xl"
      >
        {isNew ? (
          newFlowStep === "corporates" ? (
            corporatesStep
          ) : newFlowStep === "members" ? (
            membersStep
          ) : (
            formStep
          )
        ) : editLoading ? (
          <p className="text-[11px] text-slate-500">Loading pre-authorization...</p>
        ) : editError ? (
          <p className="text-[11px] text-red-600">{editError}</p>
        ) : editForm && detailId ? (
          <PreAuthorizationForm
            key={`${isViewMode ? "view" : "edit"}-${detailId}`}
            embedded
            readOnly={isViewMode}
            preAuthorizationId={isViewMode ? undefined : detailId}
            initial={editForm}
            memberBenefits={
              members.find((member) => member.memberNo === editForm.memberNo)
                ?.benefits ?? []
            }
            coverPeriods={
              members.find((member) => member.memberNo === editForm.memberNo)
                ?.coverPeriods ?? []
            }
            providerOptions={providerOptions}
            hospitalWardOptions={hospitalWardOptions}
            onSuccess={handleSaved}
            onCancel={closeFormModal}
          />
        ) : null}
      </Modal>

      <PreAuthorizationReserveModal
        open={Boolean(reserveAction)}
        mode={reserveAction?.mode ?? "top-up"}
        row={reserveAction?.row ?? null}
        subjectName={
          reserveAction
            ? resolvePreauthSubjectName({
                memberNo: reserveAction.row.memberNo,
                memberName: reserveAction.row.memberName,
                members,
                corporates,
              })
            : null
        }
        onClose={() => setReserveAction(null)}
        onSuccess={() => {
          setReserveAction(null);
          router.refresh();
        }}
      />

      <Modal
        open={Boolean(printNotice)}
        onClose={() => setPrintNotice(null)}
        title="Print Pre-authorization"
        description="Template pending"
        variant="popup"
        size="md"
      >
        <p className="text-[11px] text-slate-600">{printNotice}</p>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setPrintNotice(null)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
