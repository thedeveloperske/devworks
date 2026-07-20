"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { RenewCorporateModal } from "./RenewCorporateModal";
import type {
  CorporateListItem,
  CorporateOption,
} from "@/features/medical/corporates";
import type { LookupOption } from "@/features/medical/lookups/types";

type RenewCorporatePageClientProps = {
  corporates: CorporateListItem[];
  agentOptions: LookupOption[];
  benefitOptions: LookupOption[];
  categoryOptions: LookupOption[];
  providerOptions: LookupOption[];
};

const tableBodyMaxHeight = 280;
const tableMinWidth = 640;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

export function RenewCorporatePageClient({
  corporates,
  agentOptions,
  benefitOptions,
  categoryOptions,
  providerOptions,
}: RenewCorporatePageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [renewCorporateId, setRenewCorporateId] = useState("");

  const corporateOptions: CorporateOption[] = useMemo(
    () =>
      corporates.map((corporate) => ({
        id: corporate.id,
        corporate: corporate.corporate,
        corpId: corporate.corpId,
        policyNo: corporate.policyNo,
        corpStartDate: corporate.corpStartDate ?? "",
        corpEndDate: corporate.corpEndDate ?? "",
      })),
    [corporates]
  );

  const filteredCorporates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return corporates;

    return corporates.filter((corporate) =>
      [corporate.corporate, corporate.corpId, corporate.policyNo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [corporates, searchQuery]);

  const closeRenewModal = () => setRenewCorporateId("");

  const handleRenewSaved = () => {
    setRenewCorporateId("");
    router.refresh();
  };

  const renewOpen = Boolean(renewCorporateId);

  return (
    <div className="relative min-h-[calc(100dvh-13rem)]">
      <div className="pointer-events-none opacity-40">
        <PageHeader
          title="Renew Corporate"
          description="Select a corporate to renew onto its next cover period"
        />
      </div>

      <Modal
        open={!renewOpen}
        onClose={() => router.push("/admin/medical")}
        title="Renew Corporate"
        description="Select a corporate to renew onto its next cover period"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <div className="flex shrink-0 items-center justify-end">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              style={{ minWidth: tableMinWidth }}
            >
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className={thClass}>Corporate</th>
                  <th className={thClass}>Corp ID</th>
                  <th className={thClass}>Policy No</th>
                  <th className={thClass}>Current Period</th>
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
                    <tr
                      key={corporate.id}
                      className="bg-white hover:bg-slate-50"
                    >
                      <td className={tdClass}>
                        <button
                          type="button"
                          onClick={() => setRenewCorporateId(corporate.id)}
                          className="font-semibold text-maroon hover:underline"
                        >
                          {corporate.corporate}
                        </button>
                      </td>
                      <td className={tdClass}>{corporate.corpId ?? "—"}</td>
                      <td className={tdClass}>{corporate.policyNo ?? "—"}</td>
                      <td className={tdClass}>
                        {corporate.corpStartDate && corporate.corpEndDate
                          ? `${corporate.corpStartDate} to ${corporate.corpEndDate}`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <RenewCorporateModal
        open={renewOpen}
        corporates={corporateOptions}
        initialCorporateId={renewCorporateId || undefined}
        agentOptions={agentOptions}
        benefitOptions={benefitOptions}
        categoryOptions={categoryOptions}
        providerOptions={providerOptions}
        onClose={closeRenewModal}
        onSuccess={handleRenewSaved}
      />
    </div>
  );
}
