"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import type {
  ManageClaimsCorporateOption,
  ManageClaimsMemberOption,
  ManageClaimsProviderSummary,
} from "@/features/medical/claims/manage/types";
import type { LookupOption } from "@/features/medical/lookups/types";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";
import { ManageClaimsForm } from "./ManageClaimsForm";

const tableBodyMaxHeight = 280;
const tableMinWidth = 480;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[11px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[11px] text-slate-500";
const compactThClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500";
const compactTdClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[11px] text-slate-600";
const compactEmptyCellClass =
  "px-2.5 py-4 text-center text-[11px] text-slate-500";
const searchInputClass =
  "w-44 border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

type ManageClaimsPageClientProps = {
  providers?: ManageClaimsProviderSummary[];
  providerOptions?: LookupOption[];
  corporates?: ManageClaimsCorporateOption[];
  members?: ManageClaimsMemberOption[];
};

export function ManageClaimsPageClient({
  providers = [],
  providerOptions = [],
  corporates = [],
  members = [],
}: ManageClaimsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const selectedCorporateId = searchParams.get("corporate") ?? "";
  const selectedMemberNo = searchParams.get("member") ?? "";
  const claimModalOpen = isNew || Boolean(editId);
  const [searchQuery, setSearchQuery] = useState("");
  const [corporateSearchQuery, setCorporateSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const modalOpen = manageOpen || claimModalOpen;

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
      if (!member.corporateId || member.cancelled === 1) continue;
      counts[member.corporateId] = (counts[member.corporateId] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  const filteredProviders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return providers;

    return providers.filter((provider) =>
      [provider.providerName, provider.providerCode, String(provider.claimsCount)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [providers, searchQuery]);

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

  const closeClaimModal = useCallback(() => {
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

  const handleSaved = useCallback(() => {
    closeClaimModal();
    router.refresh();
  }, [closeClaimModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  const providersTable = (
    <div
      className="min-h-0 overflow-x-auto overflow-y-scroll border border-slate-200"
      style={{ height: tableBodyMaxHeight }}
    >
      <table
        className="w-full border-collapse"
        style={{ minWidth: tableMinWidth }}
      >
        <thead className="sticky top-0 z-10 bg-slate-50">
          <tr>
            <th className={thClass}>Provider</th>
            <th className={`${thClass} text-right`}>Claims</th>
          </tr>
        </thead>
        <tbody>
          {filteredProviders.length === 0 ? (
            <tr>
              <td colSpan={2} className={emptyCellClass}>
                {providers.length === 0
                  ? "No providers found."
                  : "No providers match your search."}
              </td>
            </tr>
          ) : (
            filteredProviders.map((provider) => (
              <tr
                key={provider.providerCode}
                className="bg-white hover:bg-slate-50"
              >
                <td className={tdClass}>
                  <span className="font-semibold text-slate-900">
                    {provider.providerName}
                  </span>
                </td>
                <td
                  className={`${tdClass} text-right font-semibold text-slate-900`}
                >
                  {provider.claimsCount}
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
      <div className="flex shrink-0 items-center justify-end gap-2">
        <input
          type="search"
          value={corporateSearchQuery}
          onChange={(e) => setCorporateSearchQuery(e.target.value)}
          placeholder="Search corporates..."
          aria-label="Search corporates"
          className={`${searchInputClass} w-full sm:w-44`}
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
          placeholder="Search by member no or name..."
          aria-label="Search members by number or name"
          className={`${searchInputClass} w-full sm:w-56`}
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
      <ManageClaimsForm
        key={selectedMember.memberNo}
        embedded
        providerOptions={providerOptions}
        initialDetails={{
          memberNo: selectedMember.memberNo,
          corpId: selectedMember.corpId,
          familyNo: selectedMember.familyNo,
          anniv: selectedMember.anniv,
          priDep: selectedMember.memberType === "Principal" ? "1" : "2",
        }}
        onSuccess={handleSaved}
        onCancel={closeClaimModal}
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
        : "New Claim";

  const newModalDescription =
    newFlowStep === "corporates"
      ? "Choose the corporate for the claim member"
      : newFlowStep === "members"
        ? selectedCorporate?.corporate
          ? `Search by member number or name under ${selectedCorporate.corporate}`
          : "Search by member number or name"
        : selectedMember
          ? `${selectedMember.name} (${selectedMember.memberNo})`
          : "Capture a new medical claim";

  return (
    <div className={`relative ${modalOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={modalOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="Manage Claims"
          description="Open Manage Claims from the menu to view and edit claims"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Manage Claims"
        description="Providers and their claim counts"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers..."
              aria-label="Search providers"
              className={searchInputClass}
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Claim
            </Button>
          </div>
          {providersTable}
        </div>
      </Modal>

      <Modal
        open={claimModalOpen}
        onClose={closeClaimModal}
        title={isNew ? newModalTitle : "Edit Claim"}
        description={
          isNew ? newModalDescription : "Update claim details"
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
        ) : editId ? (
          <ManageClaimsForm
            key={editId}
            embedded
            claimId={editId}
            providerOptions={providerOptions}
            onSuccess={handleSaved}
            onCancel={closeClaimModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
