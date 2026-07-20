"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoriesForm } from "./CategoriesForm";
import { CoverDatesForm } from "./CoverDatesForm";
import { ProviderRestrictionsForm } from "./ProviderRestrictionsForm";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { Modal } from "@/components/admin/Modal";
import {
  createEmptyCategoryGroupRow,
  createEmptyProviderRestrictionRow,
  defaultCoverDateForm,
  deriveCoverDatesFromStart,
  deriveRenewalDateFromEnd,
  renewCorporateTabs,
  validateCoverDateOrder,
  type CategoryGroupFormData,
  type CorporateOption,
  type CoverDateFormData,
  type ProviderRestrictionFormData,
  type RenewCorporateTabId,
} from "@/features/medical/corporates";
import type { LookupOption } from "@/features/medical/lookups/types";

type RenewCorporateModalProps = {
  open: boolean;
  corporates: CorporateOption[];
  /** When set, skip the corporates list tab and open on Cover Dates for this corporate. */
  initialCorporateId?: string;
  agentOptions: LookupOption[];
  benefitOptions: LookupOption[];
  categoryOptions: LookupOption[];
  providerOptions: LookupOption[];
  onClose: () => void;
  onSuccess: () => void;
};

const fieldLabelClass = "mb-0.5 block text-[12px] font-medium text-slate-700";
const fieldInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";
const corporatesTableMaxHeight = 280;
const corporatesTableMinWidth = 480;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";

function nextDay(dateValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return "";
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function stripRowIdx<T extends { idx?: number }>(row: T): Omit<T, "idx"> {
  const { idx: _idx, ...rest } = row;
  return rest;
}

export function RenewCorporateModal({
  open,
  corporates,
  initialCorporateId,
  agentOptions,
  benefitOptions,
  categoryOptions,
  providerOptions,
  onClose,
  onSuccess,
}: RenewCorporateModalProps) {
  const listOnPage = Boolean(initialCorporateId);
  const visibleTabs = listOnPage
    ? renewCorporateTabs.filter((tab) => tab.id !== "corporates")
    : renewCorporateTabs;

  const [loading, setLoading] = useState(false);
  const [loadingCorporate, setLoadingCorporate] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<RenewCorporateTabId>(
    listOnPage ? "coverDates" : "corporates"
  );
  const [corporateId, setCorporateId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [coverDateForm, setCoverDateForm] =
    useState<CoverDateFormData>(defaultCoverDateForm);
  const [categoryGroupRows, setCategoryGroupRows] = useState<
    CategoryGroupFormData[]
  >([createEmptyCategoryGroupRow()]);
  const [providerRestrictionRows, setProviderRestrictionRows] = useState<
    ProviderRestrictionFormData[]
  >([createEmptyProviderRestrictionRow()]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCorporates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return corporates;

    return corporates.filter((corporate) =>
      [corporate.corporate, corporate.corpId, corporate.policyNo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [corporates, searchQuery]);

  const selectedCorporateName =
    corporates.find((corporate) => corporate.id === corporateId)?.corporate ??
    "";

  const resetForms = (nextCorporateId = "") => {
    setCorporateId(nextCorporateId);
    setAgentId("");
    setCoverDateForm(defaultCoverDateForm);
    setCategoryGroupRows([createEmptyCategoryGroupRow()]);
    setProviderRestrictionRows([createEmptyProviderRestrictionRow()]);
    setActiveTab(listOnPage ? "coverDates" : "corporates");
    setSearchQuery("");
    setError("");
  };

  useEffect(() => {
    if (!open) return;
    const nextId = initialCorporateId ?? "";
    setCorporateId(nextId);
    setAgentId("");
    setCoverDateForm(defaultCoverDateForm);
    setCategoryGroupRows([createEmptyCategoryGroupRow()]);
    setProviderRestrictionRows([createEmptyProviderRestrictionRow()]);
    setActiveTab(nextId ? "coverDates" : "corporates");
    setSearchQuery("");
    setError("");
  }, [open, corporates, initialCorporateId]);

  useEffect(() => {
    if (!open || !corporateId) return;

    let cancelled = false;
    setLoadingCorporate(true);
    setError("");

    fetch(`/api/medical/corporates/${corporateId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load corporate");
        }
        return res.json();
      })
      .then((corporate) => {
        if (cancelled) return;

        setAgentId(corporate.agentId ?? "");

        const previous = corporate.coverAnniversary as CoverDateFormData | null;
        const previousAnniv = Number(previous?.anniv ?? "0");
        const nextAnniv =
          Number.isFinite(previousAnniv) && previousAnniv >= 0
            ? String(previousAnniv + 1)
            : "1";
        const startDate = previous?.endDate
          ? nextDay(previous.endDate)
          : previous?.renewalDate || "";
        const derived = deriveCoverDatesFromStart(startDate);

        setCoverDateForm({
          ...defaultCoverDateForm,
          startDate,
          endDate: derived.endDate,
          renewalDate: derived.renewalDate,
          anniv: nextAnniv,
          agentId: corporate.agentId ?? "",
        });

        // Seed from previous anniversary rows only; idx stripped so save inserts new rows.
        const previousAnnivKey = String(previousAnniv);
        const categories = Array.isArray(corporate.categoryGroups)
          ? corporate.categoryGroups
              .filter(
                (row: CategoryGroupFormData) =>
                  !previousAnniv ||
                  String(Number(row.anniv || "0")) === previousAnnivKey
              )
              .map((row: CategoryGroupFormData) => ({
                ...stripRowIdx(row),
                anniv: nextAnniv,
              }))
          : [];
        setCategoryGroupRows(
          categories.length > 0 ? categories : [createEmptyCategoryGroupRow()]
        );

        const providers = Array.isArray(corporate.providerRestrictions)
          ? corporate.providerRestrictions
              .filter(
                (row: ProviderRestrictionFormData) =>
                  !previousAnniv ||
                  String(Number(row.anniv || "0")) === previousAnnivKey
              )
              .map((row: ProviderRestrictionFormData) => ({
                ...stripRowIdx(row),
                anniv: nextAnniv,
              }))
          : [];
        setProviderRestrictionRows(
          providers.length > 0
            ? providers
            : [createEmptyProviderRestrictionRow()]
        );
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load corporate"
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingCorporate(false);
      });

    return () => {
      cancelled = true;
    };
  }, [corporateId, open]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleCoverDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "agentId") {
      setAgentId(value);
    }
    setCoverDateForm((prev) => {
      if (name === "startDate") {
        const derived = deriveCoverDatesFromStart(value);
        return {
          ...prev,
          startDate: value,
          endDate: derived.endDate,
          renewalDate: derived.renewalDate,
        };
      }
      if (name === "endDate") {
        return {
          ...prev,
          endDate: value,
          renewalDate: deriveRenewalDateFromEnd(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCategoryGroupRowChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCategoryGroupRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [name]: value } : row
      )
    );
  };

  const handleProviderRestrictionRowChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProviderRestrictionRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [name]: value } : row
      )
    );
  };

  const selectCorporate = (nextId: string) => {
    setCorporateId(nextId);
    if (!nextId) {
      setAgentId("");
      setCoverDateForm(defaultCoverDateForm);
      setCategoryGroupRows([createEmptyCategoryGroupRow()]);
      setProviderRestrictionRows([createEmptyProviderRestrictionRow()]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!corporateId) {
      setError("Please select a corporate");
      setLoading(false);
      return;
    }

    const coverDateOrderError = validateCoverDateOrder({
      startDate: coverDateForm.startDate,
      endDate: coverDateForm.endDate,
      renewalDate: coverDateForm.renewalDate,
    });
    if (coverDateOrderError) {
      setError(coverDateOrderError);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/medical/corporates/renewals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        corporateId,
        agentId: coverDateForm.agentId || agentId,
        anniv: coverDateForm.anniv || "1",
        periodStart: coverDateForm.startDate,
        periodEnd: coverDateForm.endDate,
        renewalDate: coverDateForm.renewalDate,
        categoryGroups: categoryGroupRows.map((row) => ({
          category: row.category,
          benefit: row.benefit,
          fund: row.fund,
          policyLimit: row.policyLimit,
          subLimitOf: row.subLimitOf,
          sharing: row.sharing,
          copayAmount: row.copayAmount,
          waitingPeriod: row.waitingPeriod,
          anniv: coverDateForm.anniv || "1",
        })),
        providerRestrictions: providerRestrictionRows.map((row) => ({
          provider: row.provider,
          anniv: coverDateForm.anniv || "1",
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to renew corporate");
      setLoading(false);
      return;
    }

    setLoading(false);
    resetForms();
    onSuccess();
  };

  const activeTabPanel = (() => {
    switch (activeTab) {
      case "corporates":
        return (
          <section className="flex h-full min-h-0 flex-col gap-1.5">
            <div className="flex shrink-0 items-center justify-end">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search corporates"
                className="w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
              />
            </div>
            <div
              className="min-h-0 overflow-x-auto overflow-y-scroll border border-slate-200"
              style={{ height: corporatesTableMaxHeight }}
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
                    filteredCorporates.map((corporate) => {
                      const selected = corporate.id === corporateId;
                      return (
                        <tr
                          key={corporate.id}
                          className={
                            selected
                              ? "bg-maroon/10"
                              : "bg-white hover:bg-slate-50"
                          }
                        >
                          <td className={tdClass}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                selectCorporate(corporate.id);
                                setActiveTab("coverDates");
                              }}
                              className="font-semibold text-maroon hover:underline"
                            >
                              {corporate.corporate}
                            </a>
                          </td>
                          <td className={tdClass}>{corporate.corpId ?? "—"}</td>
                          <td className={tdClass}>
                            {corporate.policyNo ?? "—"}
                          </td>
                          <td className={tdClass}>
                            {corporate.corpStartDate && corporate.corpEndDate
                              ? `${corporate.corpStartDate} to ${corporate.corpEndDate}`
                              : "—"}
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
      case "coverDates":
        return !corporateId ? (
          <p className="text-[12px] text-slate-500">
            Select a corporate from Corporates Ready for Renewal to load cover dates.
          </p>
        ) : loadingCorporate ? (
          <p className="text-[12px] text-slate-500">Loading corporate...</p>
        ) : (
          <CoverDatesForm
            value={coverDateForm}
            corporateAgentId={agentId}
            agentOptions={agentOptions}
            onChange={handleCoverDateChange}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
            annivDisabled
            agentDisabled={false}
            showActions={false}
            showHeader={false}
          />
        );
      case "categories":
        return (
          <CategoriesForm
            rows={categoryGroupRows}
            benefitOptions={benefitOptions}
            categoryOptions={categoryOptions}
            coverDateAnniv={coverDateForm.anniv || "1"}
            onRowChange={handleCategoryGroupRowChange}
            onAddRow={() =>
              setCategoryGroupRows((prev) => [
                ...prev,
                createEmptyCategoryGroupRow(),
              ])
            }
            onRemoveRow={(index) =>
              setCategoryGroupRows((prev) =>
                prev.filter((_, rowIndex) => rowIndex !== index)
              )
            }
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
            showHeader={false}
          />
        );
      case "providerRestrictions":
        return (
          <ProviderRestrictionsForm
            rows={providerRestrictionRows}
            coverDateAnniv={coverDateForm.anniv || "1"}
            providerOptions={providerOptions}
            onRowChange={handleProviderRestrictionRowChange}
            onAddRow={() =>
              setProviderRestrictionRows((prev) => [
                ...prev,
                createEmptyProviderRestrictionRow(),
              ])
            }
            onRemoveRow={(index) =>
              setProviderRestrictionRows((prev) =>
                prev.filter((_, rowIndex) => rowIndex !== index)
              )
            }
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
            showHeader={false}
          />
        );
    }
  })();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Renew Corporate"
      description={
        selectedCorporateName
          ? `Renew ${selectedCorporateName}`
          : "Renew Corporate"
      }
    >
      <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
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
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2">
              {activeTabPanel}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-center gap-3 border-t border-slate-200 bg-white pt-1.5">
          <Button
            type="submit"
            size="sm"
            disabled={loading || loadingCorporate || !corporateId}
          >
            {loading ? "Saving..." : "Renew Corporate"}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
