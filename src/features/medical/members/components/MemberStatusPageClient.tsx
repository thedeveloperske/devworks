"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/admin/Button";
import { FormField } from "@/components/admin/FormField";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  memberCancelReasonOptions,
  memberCoverStatusOptions,
  memberReinstateReasonOptions,
} from "@/features/medical/lookups";
import type {
  MemberStatusCorporate,
  MemberStatusRow,
} from "@/features/medical/members";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type MemberStatusPageClientProps = {
  members: MemberStatusRow[];
  corporates: MemberStatusCorporate[];
};

type StatusAction = "cancel" | "reinstate";
type StatusScope = "member" | "family";

const actionLabels: Record<StatusAction, string> = {
  cancel: "Cancelling",
  reinstate: "Reinstating",
};

const actionVerbs: Record<StatusAction, string> = {
  cancel: "Cancel",
  reinstate: "Reinstate",
};

const compactThClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
const compactTdClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[12px] text-slate-600";
const compactEmptyCellClass =
  "px-2.5 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none sm:w-44";
const compactFieldClass =
  "w-full border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildStatusHref(pathname: string, corporateId?: string) {
  if (!corporateId) return pathname;
  const params = new URLSearchParams();
  params.set("corporate", corporateId);
  return `${pathname}?${params.toString()}`;
}

function segmentButtonClass(active: boolean) {
  return active
    ? "border-maroon bg-maroon px-3 py-1.5 text-[12px] font-semibold text-white"
    : "border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-maroon hover:text-maroon";
}

function statusBadgeClass(status: string, cancelled: number | null) {
  if (cancelled === 1 || status === "3") {
    return "inline-flex border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700";
  }
  if (status === "2") {
    return "inline-flex border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800";
  }
  if (status === "1") {
    return "inline-flex border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800";
  }
  return "inline-flex border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600";
}

export function MemberStatusPageClient({
  members,
  corporates,
}: MemberStatusPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCorporateId = searchParams.get("corporate") ?? "";

  const [membersList, setMembersList] = useState(members);
  const [corporateSearchQuery, setCorporateSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [action, setAction] = useState<StatusAction>("cancel");
  const [scope, setScope] = useState<StatusScope>("member");
  const [savingKey, setSavingKey] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [pendingTarget, setPendingTarget] = useState<MemberStatusRow | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [actionDate, setActionDate] = useState(todayIsoDate);
  const [dialogError, setDialogError] = useState("");
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    setMembersList(members);
  }, [members]);

  useEffect(() => {
    setMemberSearchQuery("");
    setActionError("");
    setActionNotice("");
    setPendingTarget(null);
    setDialogError("");
    setExpandedFamilies(new Set());
  }, [selectedCorporateId]);

  useEffect(() => {
    setPendingTarget(null);
    setReason("");
    setActionDate(todayIsoDate());
    setDialogError("");
    setExpandedFamilies(new Set());
  }, [action, scope]);

  const reasonOptions =
    action === "cancel"
      ? memberCancelReasonOptions
      : memberReinstateReasonOptions;

  const statusLabelById = useMemo(
    () =>
      Object.fromEntries(
        memberCoverStatusOptions.map((option) => [option.value, option.label])
      ),
    []
  );

  const principalCountByCorporateId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of membersList) {
      if (!member.corporateId || member.memberType !== "Principal") continue;
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

  const corporatePrincipals = useMemo(() => {
    if (!selectedCorporateId) return [];
    return membersList.filter(
      (member) =>
        member.corporateId === selectedCorporateId &&
        member.memberType === "Principal"
    );
  }, [membersList, selectedCorporateId]);

  const filteredMembers = useMemo(() => {
    const corporateMembers = corporatePrincipals.filter((member) => {
      const isCancelled = member.cancelled === 1;
      if (action === "cancel" && isCancelled) return false;
      if (action === "reinstate" && !isCancelled) return false;
      return true;
    });

    const query = memberSearchQuery.trim().toLowerCase();
    if (!query) return corporateMembers;

    return corporateMembers.filter((member) =>
      [
        member.memberNo,
        member.familyNo,
        member.name,
        statusLabelById[member.status] ?? member.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [action, corporatePrincipals, memberSearchQuery, statusLabelById]);

  const dependantsByFamilyNo = useMemo(() => {
    if (!selectedCorporateId) return new Map<string, MemberStatusRow[]>();

    const map = new Map<string, MemberStatusRow[]>();
    for (const member of membersList) {
      if (
        member.corporateId !== selectedCorporateId ||
        member.memberType !== "Dependant" ||
        !member.familyNo
      ) {
        continue;
      }
      const isCancelled = member.cancelled === 1;
      if (action === "cancel" && isCancelled) continue;
      if (action === "reinstate" && !isCancelled) continue;
      const list = map.get(member.familyNo) ?? [];
      list.push(member);
      map.set(member.familyNo, list);
    }
    return map;
  }, [action, membersList, selectedCorporateId]);

  const familyMembersForConfirm = useMemo(() => {
    if (!pendingTarget || scope !== "family" || !pendingTarget.familyNo) {
      return [];
    }
    return membersList.filter(
      (member) =>
        member.familyNo === pendingTarget.familyNo &&
        (action === "cancel"
          ? member.cancelled !== 1
          : member.cancelled === 1)
    );
  }, [action, membersList, pendingTarget, scope]);

  const toggleFamily = useCallback((familyNo: string) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(familyNo)) next.delete(familyNo);
      else next.add(familyNo);
      return next;
    });
  }, []);

  const membersEmptyMessage = useMemo(() => {
    if (corporatePrincipals.length === 0) {
      return "No principal members found for this corporate.";
    }
    const eligibleCount = corporatePrincipals.filter((member) => {
      const isCancelled = member.cancelled === 1;
      if (action === "cancel" && isCancelled) return false;
      if (action === "reinstate" && !isCancelled) return false;
      return true;
    }).length;
    if (eligibleCount === 0) {
      return action === "cancel"
        ? "No active principal members to cancel."
        : "No cancelled principal members to reinstate.";
    }
    if (memberSearchQuery.trim()) {
      return "No principal members match your search.";
    }
    return "No principal members found.";
  }, [action, corporatePrincipals, memberSearchQuery]);

  const closeModal = useCallback(() => {
    router.replace("/admin/medical");
  }, [router]);

  const backToCorporates = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const closeConfirmDialog = useCallback(() => {
    if (savingKey) return;
    setPendingTarget(null);
    setDialogError("");
  }, [savingKey]);

  const openConfirmDialog = useCallback((target: MemberStatusRow) => {
    setActionError("");
    setActionNotice("");
    setDialogError("");
    setReason("");
    setActionDate(todayIsoDate());
    setPendingTarget(target);
  }, []);

  const confirmApply = useCallback(async () => {
    if (!pendingTarget) return;

    if (!reason) {
      setDialogError("Select a reason.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(actionDate)) {
      setDialogError("Enter a valid date.");
      return;
    }

    setDialogError("");
    setActionError("");
    setActionNotice("");
    setSavingKey(pendingTarget.memberNo);

    try {
      const res = await fetch("/api/medical/members/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          scope,
          memberNo: pendingTarget.memberNo,
          reason,
          date: actionDate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update member status");
      }

      const updatedMemberNos = new Set<string>(data.memberNos ?? []);
      const targetMemberNos = new Set<string>(
        data.targetMemberNos ?? data.memberNos ?? []
      );
      const newStatus = String(data.status ?? "");
      const newCancelled = Number(
        data.cancelled ?? (action === "cancel" ? 1 : 0)
      );
      setMembersList((prev) =>
        prev.map((member) => {
          if (!targetMemberNos.has(member.memberNo)) return member;
          return {
            ...member,
            cancelled: newCancelled,
            status: updatedMemberNos.has(member.memberNo)
              ? newStatus
              : member.status,
          };
        })
      );
      const skippedNote =
        data.skipped > 0 ? ` (${data.skipped} without cover history)` : "";
      setActionNotice(
        `${actionLabels[action]} applied to ${data.updated} member${
          data.updated === 1 ? "" : "s"
        }${skippedNote}.`
      );
      setPendingTarget(null);
      router.refresh();
    } catch (error: unknown) {
      setDialogError(
        error instanceof Error
          ? error.message
          : "Failed to update member status"
      );
    } finally {
      setSavingKey("");
    }
  }, [action, actionDate, pendingTarget, reason, router, scope]);

  const saving = savingKey !== "";
  const rowActionLabel =
    scope === "family" ? `${actionVerbs[action]} family` : actionVerbs[action];

  const corporatesStep = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-slate-600">
          Choose a corporate to manage cover status
        </p>
        <input
          type="search"
          value={corporateSearchQuery}
          onChange={(e) => setCorporateSearchQuery(e.target.value)}
          placeholder="Search corporates..."
          aria-label="Search corporates"
          className={searchInputClass}
        />
      </div>
      <div className={`${tableWrapperClass} min-h-0 flex-1 overflow-auto`}>
        <table className={tableClass}>
          <thead className={tableHeadClass}>
            <tr>
              <th className={compactThClass}>Corporate</th>
              <th className={compactThClass}>Corp ID</th>
              <th className={compactThClass}>Policy No</th>
              <th className={compactThClass}>Principals</th>
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
                    <Link
                      href={buildStatusHref(pathname, corporate.id)}
                      scroll={false}
                      className="font-semibold text-maroon hover:underline"
                    >
                      {corporate.corporate}
                    </Link>
                  </td>
                  <td className={compactTdClass}>
                    {corporate.corpId ?? "—"}
                  </td>
                  <td className={compactTdClass}>
                    {corporate.policyNo ?? "—"}
                  </td>
                  <td className={compactTdClass}>
                    {principalCountByCorporateId[corporate.id] ?? 0}
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
      <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={backToCorporates}
            disabled={saving}
            className="min-w-0 truncate text-left text-[12px] font-semibold text-maroon hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
          >
            {selectedCorporate?.corporate ?? "All corporates"}
          </button>
          <input
            type="search"
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            placeholder="Search principals..."
            aria-label="Search principal members"
            className={searchInputClass}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div
            role="group"
            aria-label="Action"
            className="flex flex-wrap items-center gap-1"
          >
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Action
            </span>
            <button
              type="button"
              aria-pressed={action === "cancel"}
              disabled={saving}
              onClick={() => setAction("cancel")}
              className={segmentButtonClass(action === "cancel")}
            >
              Cancel
            </button>
            <button
              type="button"
              aria-pressed={action === "reinstate"}
              disabled={saving}
              onClick={() => setAction("reinstate")}
              className={segmentButtonClass(action === "reinstate")}
            >
              Reinstate
            </button>
          </div>

          <div
            role="group"
            aria-label="Scope"
            className="flex flex-wrap items-center gap-1"
          >
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Scope
            </span>
            <button
              type="button"
              aria-pressed={scope === "member"}
              disabled={saving}
              onClick={() => setScope("member")}
              className={segmentButtonClass(scope === "member")}
            >
              Person
            </button>
            <button
              type="button"
              aria-pressed={scope === "family"}
              disabled={saving}
              onClick={() => setScope("family")}
              className={segmentButtonClass(scope === "family")}
            >
              Whole family
            </button>
          </div>
        </div>

        <p className="text-[12px] text-slate-500">
          {scope === "family"
            ? `${actionVerbs[action]} Family applies to every eligible member under the selected principal.`
            : `${actionVerbs[action]} Person applies to one person. Expand a principal to act on Spouse, Son, Daughter, or other dependants.`}
        </p>
      </div>

      {actionError ? (
        <p className="shrink-0 text-[12px] text-red-600">{actionError}</p>
      ) : null}
      {actionNotice ? (
        <p className="shrink-0 text-[12px] text-emerald-700">{actionNotice}</p>
      ) : null}

      <div className={`${tableWrapperClass} min-h-0 flex-1 overflow-auto`}>
        <table className={tableClass}>
          <thead className={tableHeadClass}>
            <tr>
              <th className={compactThClass}>Member No</th>
              <th className={compactThClass}>Family No</th>
              <th className={compactThClass}>Name</th>
              <th className={compactThClass}>Anniv</th>
              <th className={compactThClass}>Status</th>
              <th className={`${compactThClass} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className={compactEmptyCellClass}>
                  {membersEmptyMessage}
                </td>
              </tr>
            ) : (
              filteredMembers.flatMap((member) => {
                const familyNo = member.familyNo;
                const dependants =
                  scope === "member" && familyNo
                    ? dependantsByFamilyNo.get(familyNo) ?? []
                    : [];
                const expanded =
                  Boolean(familyNo) && expandedFamilies.has(familyNo);
                const hasCover = member.anniv !== "";
                const rowDisabled =
                  saving || (scope === "member" && !hasCover);
                const statusText = member.status
                  ? (statusLabelById[member.status] ?? member.status)
                  : hasCover
                    ? "—"
                    : "No cover history";

                const rows = [
                  <tr
                    key={member.memberNo}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className={compactTdClass}>
                      <div className="flex items-center gap-1">
                        {scope === "member" && dependants.length > 0 ? (
                          <button
                            type="button"
                            aria-label={
                              expanded
                                ? `Hide family for ${member.name}`
                                : `Show family for ${member.name}`
                            }
                            aria-expanded={expanded}
                            onClick={() => toggleFamily(familyNo)}
                            className="inline-flex size-5 items-center justify-center text-slate-500 hover:text-maroon"
                          >
                            <ChevronRight
                              className={`size-3.5 transition ${
                                expanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        ) : (
                          <span className="inline-flex size-5" />
                        )}
                        <span className="font-medium text-slate-800">
                          {member.memberNo}
                        </span>
                      </div>
                    </td>
                    <td className={compactTdClass}>
                      {member.familyNo || "—"}
                    </td>
                    <td className={compactTdClass}>
                      <span className="font-medium text-slate-800">
                        {member.name}
                      </span>
                      {dependants.length > 0 && scope === "member" ? (
                        <span className="ml-1.5 text-slate-400">
                          · {dependants.length} dependant
                          {dependants.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </td>
                    <td className={compactTdClass}>{member.anniv || "—"}</td>
                    <td className={compactTdClass}>
                      <span
                        className={statusBadgeClass(
                          member.status,
                          member.cancelled
                        )}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className={`${compactTdClass} text-right`}>
                      <Button
                        type="button"
                        size="sm"
                        variant={action === "cancel" ? "danger" : "primary"}
                        onClick={() => openConfirmDialog(member)}
                        disabled={rowDisabled}
                      >
                        {savingKey === member.memberNo
                          ? "Applying..."
                          : rowActionLabel}
                      </Button>
                    </td>
                  </tr>,
                ];

                if (expanded) {
                  for (const dependant of dependants) {
                    const dependantHasCover = dependant.anniv !== "";
                    const dependantStatus = dependant.status
                      ? (statusLabelById[dependant.status] ?? dependant.status)
                      : dependantHasCover
                        ? "—"
                        : "No cover history";
                    rows.push(
                      <tr
                        key={dependant.memberNo}
                        className="bg-slate-50/70 transition-colors hover:bg-slate-100"
                      >
                        <td className={compactTdClass}>
                          <div className="flex items-center gap-1 pl-5">
                            <span className="inline-flex size-5" />
                            <span>{dependant.memberNo}</span>
                          </div>
                        </td>
                        <td className={compactTdClass}>
                          {dependant.familyNo || "—"}
                        </td>
                        <td className={compactTdClass}>
                          {dependant.name}
                          <span className="ml-1.5 text-slate-400">
                            · {dependant.relationLabel}
                          </span>
                        </td>
                        <td className={compactTdClass}>
                          {dependant.anniv || "—"}
                        </td>
                        <td className={compactTdClass}>
                          <span
                            className={statusBadgeClass(
                              dependant.status,
                              dependant.cancelled
                            )}
                          >
                            {dependantStatus}
                          </span>
                        </td>
                        <td className={`${compactTdClass} text-right`}>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              action === "cancel" ? "danger" : "primary"
                            }
                            onClick={() => openConfirmDialog(dependant)}
                            disabled={saving || !dependantHasCover}
                          >
                            {savingKey === dependant.memberNo
                              ? "Applying..."
                              : actionVerbs[action]}
                          </Button>
                        </td>
                      </tr>
                    );
                  }
                }

                return rows;
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[calc(100dvh-13rem)]">
      <div className="pointer-events-none opacity-40">
        <PageHeader
          title="Member Cancellation & Reinstate"
          description="Update the cover status of members"
        />
      </div>

      <Modal
        open
        onClose={closeModal}
        title={
          selectedCorporateId
            ? `${actionVerbs[action]} · ${
                scope === "family" ? "Whole family" : "Person"
              }`
            : "Member Cancellation & Reinstate"
        }
        description={
          selectedCorporateId
            ? selectedCorporate?.corporate
              ? `Principal members under ${selectedCorporate.corporate}`
              : "Principal members"
            : "Select a corporate, then cancel or reinstate by principal"
        }
        size="xl"
      >
        {selectedCorporateId ? membersStep : corporatesStep}
      </Modal>

      <Modal
        open={Boolean(pendingTarget)}
        onClose={closeConfirmDialog}
        title={`${actionVerbs[action]} ${
          scope === "family" ? "family" : "member"
        }`}
        description={
          pendingTarget
            ? scope === "family"
              ? `Whole family of ${pendingTarget.name}`
              : `${pendingTarget.name}${
                  pendingTarget.memberType !== "Principal"
                    ? ` · ${pendingTarget.relationLabel}`
                    : ""
                }`
            : undefined
        }
        variant="popup"
        size="md"
      >
        {pendingTarget ? (
          <div className="space-y-3">
            {scope === "family" && familyMembersForConfirm.length > 0 ? (
              <div className="border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Will affect {familyMembersForConfirm.length} member
                  {familyMembersForConfirm.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-1.5 max-h-28 space-y-1 overflow-y-auto">
                  {familyMembersForConfirm.map((member) => (
                    <li
                      key={member.memberNo}
                      className="text-[12px] text-slate-700"
                    >
                      {member.name}
                      <span className="text-slate-400">
                        {" "}
                        · {member.relationLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <FormField
              id="status-reason"
              name="reason"
              label="Reason"
              as="select"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={[
                { value: "", label: "Select reason" },
                ...reasonOptions,
              ]}
              labelClassName="mb-0.5 block text-[12px] font-medium text-slate-700"
              inputClassName={compactFieldClass}
              disabled={Boolean(savingKey)}
            />
            <FormField
              id="status-date"
              name="date"
              label={action === "cancel" ? "Cancel date" : "Reinstate date"}
              type="date"
              required
              value={actionDate}
              onChange={(e) => setActionDate(e.target.value)}
              labelClassName="mb-0.5 block text-[12px] font-medium text-slate-700"
              inputClassName={compactFieldClass}
              disabled={Boolean(savingKey)}
            />
            {dialogError ? (
              <p className="text-[12px] text-red-600">{dialogError}</p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeConfirmDialog}
                disabled={Boolean(savingKey)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant={action === "cancel" ? "danger" : "primary"}
                onClick={confirmApply}
                disabled={Boolean(savingKey)}
              >
                {savingKey ? "Applying..." : actionVerbs[action]}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
