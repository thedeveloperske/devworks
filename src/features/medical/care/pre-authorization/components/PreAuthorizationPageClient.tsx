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
import { PreAuthorizationForm } from "./PreAuthorizationForm";

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
  "whitespace-nowrap px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
const compactTdClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[12px] text-slate-600";
const compactEmptyCellClass =
  "px-2.5 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

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
  const manageOpen = searchParams.get("manage") === "1";
  const selectedCorporateId = searchParams.get("corporate") ?? "";
  const selectedMemberNo = searchParams.get("member") ?? "";
  const formModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || formModalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [corporateSearchQuery, setCorporateSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [editState, setEditState] = useState<EditState | null>(null);

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
        row.provider,
        row.providerName,
        row.reportedBy,
        row.authorizedBy,
        row.preDiagnosis,
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

  const openCorporateStep = useCallback(() => {
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

  const openEditModal = useCallback(
    (id: string) => {
      router.push(`${pathname}?manage=1&edit=${id}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleSaved = useCallback(() => {
    closeFormModal();
    router.refresh();
  }, [closeFormModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editId) return;

    let cancelled = false;

    fetch(`/api/medical/care/pre-authorization/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load pre-authorization");
        }
        return res.json();
      })
      .then((row) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          form: preAuthorizationToFormValues(row),
          label: `Code ${row.code} · ${row.memberNo}`,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
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
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editForm = editState?.id === editId ? editState.form : null;
  const editLabel = editState?.id === editId ? editState.label : "";
  const editError = editState?.id === editId ? editState.error : "";
  const editingRow = editId
    ? preAuthorizations.find((row) => row.id === editId)
    : undefined;

  const rowsTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Code</th>
            <th className={compactThClass}>Member No</th>
            <th className={compactThClass}>Provider</th>
            <th className={compactThClass}>Date Reported</th>
            <th className={compactThClass}>Pre Diagnosis</th>
            <th className={compactThClass}>Validity</th>
            <th className={compactThClass}>Authorized By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={7} className={compactEmptyCellClass}>
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
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(row.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {row.code}
                  </button>
                </td>
                <td className={compactTdClass}>{row.memberNo}</td>
                <td className={compactTdClass}>
                  {row.providerName
                    ? `${row.providerName} (${row.provider})`
                    : row.provider}
                </td>
                <td className={compactTdClass}>
                  {row.dateReported ? formatDate(row.dateReported) : "—"}
                </td>
                <td className={compactTdClass}>{row.preDiagnosis ?? "—"}</td>
                <td className={compactTdClass}>
                  {row.validityDate ? formatDate(row.validityDate) : "—"}
                </td>
                <td className={compactTdClass}>{row.authorizedBy ?? "—"}</td>
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
        <p className="text-[12px] text-slate-600">
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
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openCorporateStep}
            className="w-full shrink-0 sm:w-auto"
          >
            Back
          </Button>
          <p className="min-w-0 wrap-break-word text-[12px] text-slate-600 sm:truncate">
            {selectedCorporate?.corporate ?? "Members"}
          </p>
        </div>
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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => openMembersStep(selectedCorporateId)}
          className="w-full shrink-0 sm:w-auto"
        >
          Back
        </Button>
        <p className="min-w-0 wrap-break-word text-[12px] text-slate-600 sm:truncate">
          {selectedMember.name} ({selectedMember.memberNo})
          {selectedCorporate?.corporate
            ? ` · ${selectedCorporate.corporate}`
            : ""}
        </p>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PreAuthorizationForm
          key={selectedMember.memberNo}
          embedded
          lockMemberNo
          initial={{
            memberNo: selectedMember.memberNo,
            anniv: selectedMember.anniv,
          }}
          providerOptions={providerOptions}
          hospitalWardOptions={hospitalWardOptions}
          onSuccess={handleSaved}
          onCancel={closeFormModal}
        />
      </div>
    </div>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={openCorporateStep}>
          Back
        </Button>
      </div>
      <p className="text-[12px] text-red-600">Selected member was not found.</p>
    </div>
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
            : "Edit Pre-authorization"
        }
        description={
          isNew
            ? newModalDescription
            : editLabel ||
              (editingRow
                ? `Code ${editingRow.code} · ${editingRow.memberNo}`
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
          <p className="text-[12px] text-slate-500">Loading pre-authorization...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editForm && editId ? (
          <PreAuthorizationForm
            key={editId}
            embedded
            preAuthorizationId={editId}
            initial={editForm}
            providerOptions={providerOptions}
            hospitalWardOptions={hospitalWardOptions}
            onSuccess={handleSaved}
            onCancel={closeFormModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
