"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type MemberStatusPageClientProps = {
  members: MemberStatusRow[];
  corporates: MemberStatusCorporate[];
};

type StatusAction = "cancel" | "reinstate";
type StatusScope = "member" | "family";

type StatusModeOption = {
  action: StatusAction;
  scope: StatusScope;
  label: string;
};

const statusModeOptions: StatusModeOption[] = [
  { action: "cancel", scope: "member", label: "Cancel Member" },
  { action: "cancel", scope: "family", label: "Cancel Family" },
  { action: "reinstate", scope: "member", label: "Reinstate Member" },
  { action: "reinstate", scope: "family", label: "Reinstate Family" },
];

const actionLabels: Record<StatusAction, string> = {
  cancel: "Cancelling",
  reinstate: "Reinstating",
};

const actionVerbs: Record<StatusAction, string> = {
  cancel: "Cancel",
  reinstate: "Reinstate",
};

const tableBodyMaxHeight = 280;
const corporatesTableMinWidth = 560;
const membersTableMinWidth = 720;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";
const applyButtonClass =
  "border border-maroon bg-maroon px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-maroon/90 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500";
const modeButtonClass = (active: boolean) =>
  active
    ? "border border-maroon bg-maroon px-2.5 py-1 text-[12px] font-semibold text-white"
    : "border border-slate-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
const compactFieldClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildStatusHref(pathname: string, corporateId?: string) {
  if (!corporateId) return pathname;
  const params = new URLSearchParams();
  params.set("corporate", corporateId);
  return `${pathname}?${params.toString()}`;
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

  useEffect(() => {
    setMembersList(members);
  }, [members]);

  useEffect(() => {
    setMemberSearchQuery("");
    setActionError("");
    setActionNotice("");
    setPendingTarget(null);
    setDialogError("");
  }, [selectedCorporateId]);

  useEffect(() => {
    setPendingTarget(null);
    setReason("");
    setActionDate(todayIsoDate());
    setDialogError("");
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

  const memberCountByCorporateId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of membersList) {
      if (!member.corporateId) continue;
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
    let corporateMembers = membersList.filter(
      (member) => member.corporateId === selectedCorporateId
    );

    // Cancelling targets members not yet cancelled (null/0); Reinstating
    // targets cancelled ones (1). Family scope only lists principals.
    corporateMembers = corporateMembers.filter((member) => {
      const isCancelled = member.cancelled === 1;
      if (action === "cancel" && isCancelled) return false;
      if (action === "reinstate" && !isCancelled) return false;
      return scope === "family" ? member.memberType === "Principal" : true;
    });

    const query = memberSearchQuery.trim().toLowerCase();
    if (!query) return corporateMembers;

    return corporateMembers.filter((member) =>
      [
        member.memberNo,
        member.familyNo,
        member.name,
        member.memberType,
        statusLabelById[member.status] ?? member.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [
    action,
    memberSearchQuery,
    membersList,
    scope,
    selectedCorporateId,
    statusLabelById,
  ]);

  const closeModal = useCallback(() => {
    router.replace("/admin/medical");
  }, [router]);

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
                      href={buildStatusHref(pathname, corporate.id)}
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

  const saving = savingKey !== "";
  const rowActionLabel =
    scope === "family" ? `${actionVerbs[action]} family` : actionVerbs[action];

  const membersTable = (
    <section className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] text-slate-600">
          {selectedCorporate?.corporate ?? "Members"}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <input
            type="text"
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search members"
            className={searchInputClass}
          />
          {statusModeOptions.map((option) => {
            const active =
              action === option.action && scope === option.scope;
            return (
              <button
                key={`${option.action}-${option.scope}`}
                type="button"
                aria-pressed={active}
                disabled={saving}
                onClick={() => {
                  setAction(option.action);
                  setScope(option.scope);
                }}
                className={modeButtonClass(active)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      {actionError ? (
        <p className="shrink-0 text-[12px] text-red-600">{actionError}</p>
      ) : null}
      {actionNotice ? (
        <p className="shrink-0 text-[12px] text-emerald-700">{actionNotice}</p>
      ) : null}
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
              <th className={thClass}>Family No</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Anniv</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className={emptyCellClass}>
                  {membersList.some(
                    (member) => member.corporateId === selectedCorporateId
                  )
                    ? "No members match your search."
                    : "No members found for this corporate."}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const hasCover = member.anniv !== "";
                const rowSaving = savingKey === member.memberNo;
                const rowDisabled =
                  saving || (scope === "member" && !hasCover);
                return (
                  <tr
                    key={member.memberNo}
                    className="bg-white hover:bg-slate-50"
                  >
                    <td className={tdClass}>{member.memberNo}</td>
                    <td className={tdClass}>{member.familyNo || "—"}</td>
                    <td className={tdClass}>{member.name}</td>
                    <td className={tdClass}>{member.memberType}</td>
                    <td className={tdClass}>{member.anniv || "—"}</td>
                    <td className={tdClass}>
                      {member.status
                        ? (statusLabelById[member.status] ?? member.status)
                        : hasCover
                          ? "—"
                          : "No cover history"}
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={() => openConfirmDialog(member)}
                        disabled={rowDisabled}
                        className={applyButtonClass}
                      >
                        {rowSaving ? "Applying..." : rowActionLabel}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
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
        title="Member Cancellation & Reinstate"
        description="Select a corporate, choose an action, then apply it from a member row"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {selectedCorporateId ? membersTable : corporatesTable}
        </div>
      </Modal>

      {pendingTarget ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close confirmation"
            className="absolute inset-0 bg-slate-900/40"
            onClick={closeConfirmDialog}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-confirm-title"
            className="relative w-full max-w-sm border border-slate-200 bg-white p-4 shadow-lg"
          >
            <h3
              id="status-confirm-title"
              className="text-[12px] font-bold uppercase text-slate-900"
            >
              {actionVerbs[action]}{" "}
              {scope === "family" ? "family" : "member"}
            </h3>
            <p className="mt-1 text-[12px] text-slate-600">
              {scope === "family"
                ? `Family ${pendingTarget.familyNo || pendingTarget.memberNo}`
                : `${pendingTarget.memberNo} — ${pendingTarget.name}`}
            </p>

            <div className="mt-3 flex flex-col gap-2.5">
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
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeConfirmDialog}
                disabled={Boolean(savingKey)}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={confirmApply}
                disabled={Boolean(savingKey)}
              >
                {savingKey ? "Applying..." : actionVerbs[action]}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
