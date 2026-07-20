"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import type {
  MemberRenewCorporate,
  MemberRenewRow,
} from "@/features/medical/members";

type MemberRenewPageClientProps = {
  members: MemberRenewRow[];
  corporates: MemberRenewCorporate[];
};

const tableBodyMaxHeight = 280;
const corporatesTableMinWidth = 640;
const membersTableMinWidth = 720;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";
const renewButtonClass =
  "border border-maroon bg-maroon px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-maroon/90 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500";
const skipButtonClass =
  "border border-slate-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-700 hover:border-maroon hover:text-maroon disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400";

function buildRenewHref(pathname: string, corporateId?: string) {
  if (!corporateId) return pathname;
  const params = new URLSearchParams();
  params.set("corporate", corporateId);
  return `${pathname}?${params.toString()}`;
}

export function MemberRenewPageClient({
  members,
  corporates,
}: MemberRenewPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCorporateId = searchParams.get("corporate") ?? "";

  const [membersList, setMembersList] = useState(members);
  const [corporateSearchQuery, setCorporateSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [skippedMemberNos, setSkippedMemberNos] = useState<Set<string>>(
    () => new Set()
  );
  const [savingKey, setSavingKey] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    setMembersList(members);
  }, [members]);

  useEffect(() => {
    setMemberSearchQuery("");
    setSkippedMemberNos(new Set());
    setActionError("");
    setActionNotice("");
  }, [selectedCorporateId]);

  const selectedCorporate = useMemo(
    () => corporates.find((corporate) => corporate.id === selectedCorporateId),
    [corporates, selectedCorporateId]
  );

  // Only active principals count — cancelled is 1 when cancelled, null/0 otherwise.
  const memberCountByCorporateId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of membersList) {
      if (!member.corporateId || member.memberType !== "Principal") continue;
      if (member.cancelled === 1) continue;
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

  // Only active principals are listed (cancelled null or 0). Dependants are
  // renewed with their principal; the API skips anyone already on the current period.
  const dueMembers = useMemo(() => {
    if (!selectedCorporate) return [];
    return membersList.filter(
      (member) =>
        member.corporateId === selectedCorporate.id &&
        member.memberType === "Principal" &&
        member.cancelled !== 1
    );
  }, [membersList, selectedCorporate]);

  const renewableMembers = useMemo(
    () => dueMembers.filter((member) => !skippedMemberNos.has(member.memberNo)),
    [dueMembers, skippedMemberNos]
  );

  const filteredMembers = useMemo(() => {
    const query = memberSearchQuery.trim().toLowerCase();
    if (!query) return dueMembers;

    return dueMembers.filter((member) =>
      [member.memberNo, member.familyNo, member.name, member.memberType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [dueMembers, memberSearchQuery]);

  const closeModal = useCallback(() => {
    router.replace("/admin/medical");
  }, [router]);

  const skipFamily = useCallback((memberNo: string) => {
    setActionError("");
    setActionNotice("");
    setSkippedMemberNos((prev) => {
      const next = new Set(prev);
      next.add(memberNo);
      return next;
    });
  }, []);

  const includeFamily = useCallback((memberNo: string) => {
    setActionError("");
    setActionNotice("");
    setSkippedMemberNos((prev) => {
      const next = new Set(prev);
      next.delete(memberNo);
      return next;
    });
  }, []);

  const renewEnmass = useCallback(async () => {
    if (!selectedCorporate || renewableMembers.length === 0) return;

    if (
      !window.confirm(
        `Renew ${renewableMembers.length} principal${
          renewableMembers.length === 1 ? "" : "s"
        } and their families for ${
          selectedCorporate.corporate
        }?${
          skippedMemberNos.size > 0
            ? ` (${skippedMemberNos.size} family${
                skippedMemberNos.size === 1 ? "" : "ies"
              } skipped)`
            : ""
        }`
      )
    ) {
      return;
    }

    setActionError("");
    setActionNotice("");
    setSavingKey("enmass");

    try {
      const res = await fetch("/api/medical/members/renewals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corporateId: selectedCorporate.id,
          memberNos: renewableMembers.map((member) => member.memberNo),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to renew members");
      }

      const renewedByMemberNo = new Map<string, number>(
        (data.renewed ?? []).map(
          (row: { memberNo: string; anniv: number }) => [
            row.memberNo,
            row.anniv,
          ]
        )
      );
      const newEndDate = String(data.endDate ?? "");
      setMembersList((prev) =>
        prev.map((member) => {
          const anniv = renewedByMemberNo.get(member.memberNo);
          if (anniv == null) return member;
          return { ...member, anniv: String(anniv), endDate: newEndDate };
        })
      );
      setSkippedMemberNos(new Set());

      const notes: string[] = [];
      if (data.skippedCurrent > 0) {
        notes.push(`${data.skippedCurrent} already on the current period`);
      }
      if (data.skippedCancelled > 0) {
        notes.push(`${data.skippedCancelled} cancelled`);
      }
      setActionNotice(
        `Renewed ${data.renewedCount} member${
          data.renewedCount === 1 ? "" : "s"
        }${notes.length > 0 ? ` (skipped: ${notes.join(", ")})` : ""}.`
      );
      router.refresh();
    } catch (error: unknown) {
      setActionError(
        error instanceof Error ? error.message : "Failed to renew members"
      );
    } finally {
      setSavingKey("");
    }
  }, [
    renewableMembers,
    router,
    selectedCorporate,
    skippedMemberNos.size,
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
              <th className={thClass}>Current Period</th>
              <th className={thClass}>Principals</th>
            </tr>
          </thead>
          <tbody>
            {filteredCorporates.length === 0 ? (
              <tr>
                <td colSpan={5} className={emptyCellClass}>
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
                      href={buildRenewHref(pathname, corporate.id)}
                      scroll={false}
                      className="font-semibold text-maroon hover:underline"
                    >
                      {corporate.corporate}
                    </Link>
                  </td>
                  <td className={tdClass}>{corporate.corpId ?? "—"}</td>
                  <td className={tdClass}>{corporate.policyNo ?? "—"}</td>
                  <td className={tdClass}>
                    {corporate.corpStartDate && corporate.corpEndDate
                      ? `${corporate.corpStartDate} to ${corporate.corpEndDate}`
                      : "—"}
                  </td>
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
  const hasCorpPeriod = Boolean(selectedCorporate?.corpEndDate);

  const membersTable = (
    <section className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="flex shrink-0 items-center justify-end gap-2">
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="text"
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search members"
            className={searchInputClass}
          />
          <Button
            type="button"
            size="sm"
            onClick={renewEnmass}
            disabled={saving || !hasCorpPeriod || renewableMembers.length === 0}
          >
            {savingKey === "enmass" ? "Renewing..." : "Renew Enmass"}
          </Button>
        </div>
      </div>
      {!hasCorpPeriod ? (
        <p className="shrink-0 text-[12px] text-amber-700">
          This corporate has no cover period. Renew the corporate first.
        </p>
      ) : null}
      {skippedMemberNos.size > 0 ? (
        <p className="shrink-0 text-[12px] text-slate-500">
          {skippedMemberNos.size} family
          {skippedMemberNos.size === 1 ? "" : "ies"} skipped from Renew Enmass.
          Use Include family to put them back.
        </p>
      ) : null}
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
              <th className={thClass}>Cover End</th>
              <th className={thClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className={emptyCellClass}>
                  {dueMembers.length === 0
                    ? "No active principals found for this corporate."
                    : "No principals match your search."}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const skipped = skippedMemberNos.has(member.memberNo);
                return (
                  <tr
                    key={member.memberNo}
                    className={
                      skipped
                        ? "bg-slate-50 text-slate-400"
                        : "bg-white hover:bg-slate-50"
                    }
                  >
                    <td className={tdClass}>{member.memberNo}</td>
                    <td className={tdClass}>{member.familyNo || "—"}</td>
                    <td className={tdClass}>{member.name}</td>
                    <td className={tdClass}>{member.memberType}</td>
                    <td className={tdClass}>{member.anniv || "—"}</td>
                    <td className={tdClass}>{member.endDate || "—"}</td>
                    <td className={tdClass}>
                      {skipped ? (
                        <button
                          type="button"
                          onClick={() => includeFamily(member.memberNo)}
                          disabled={saving}
                          className={renewButtonClass}
                        >
                          Include family
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => skipFamily(member.memberNo)}
                          disabled={saving}
                          className={skipButtonClass}
                        >
                          Skip family
                        </button>
                      )}
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
          title="Renew Members"
          description="Renew members onto their corporate's current cover period"
        />
      </div>

      <Modal
        open
        onClose={closeModal}
        title="Renew Members"
        description={
          selectedCorporate
            ? `${selectedCorporate.corporate}${
                hasCorpPeriod
                  ? ` — current period ${selectedCorporate.corpStartDate} to ${selectedCorporate.corpEndDate}`
                  : ""
              }`
            : "Select a corporate to renew its members"
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {selectedCorporateId ? membersTable : corporatesTable}
        </div>
      </Modal>
    </div>
  );
}
