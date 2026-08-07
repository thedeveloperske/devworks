"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CorporateActionsMenu } from "./CorporateActionsMenu";
import { CorporateForm } from "./CorporateForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  corporateToFormValues,
  type CorporateFormData,
  type CorporateListItem,
  type CategoryGroupFormData,
  type ContactPersonFormData,
  type CoverDateFormData,
  type ProviderRestrictionFormData,
  type PremiumRateFormData,
} from "@/features/medical/corporates";
import { businessClassOptions } from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";

const tableBodyMaxHeight = 280;
const tableMinWidth = 720;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[11px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[11px] text-slate-500";

type CorporatesPageClientProps = {
  corporates: CorporateListItem[];
  agentOptions: LookupOption[];
  benefitOptions: LookupOption[];
  categoryOptions: LookupOption[];
  hospitalWardOptions: LookupOption[];
  providerOptions: LookupOption[];
};

type DetailCorporateState = {
  id: string;
  corporate: CorporateFormData | null;
  coverDates: CoverDateFormData | null;
  contactPersons: ContactPersonFormData[];
  categoryGroups: CategoryGroupFormData[];
  providerRestrictions: ProviderRestrictionFormData[];
  premiumRates: PremiumRateFormData[];
  name: string;
  error: string;
};

export function CorporatesPageClient({
  corporates,
  agentOptions,
  benefitOptions,
  categoryOptions,
  hospitalWardOptions,
  providerOptions,
}: CorporatesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const manageOpen = searchParams.get("manage") === "1";
  const detailId = editId ?? viewId;
  const isViewMode = Boolean(viewId) && !editId && !isNew;
  const corporateModalOpen = isNew || Boolean(detailId);
  const [searchQuery, setSearchQuery] = useState("");
  const modalOpen = manageOpen || corporateModalOpen;

  const [detailState, setDetailState] = useState<DetailCorporateState | null>(
    null
  );

  const agentLabelById = useMemo(
    () =>
      Object.fromEntries(
        agentOptions.map((option) => [option.value, option.label])
      ),
    [agentOptions]
  );

  const businessClassLabelByCode = useMemo(
    () =>
      Object.fromEntries(
        businessClassOptions.map((option) => [option.value, option.label])
      ),
    []
  );

  const filteredCorporates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return corporates;

    return corporates.filter((corporate) => {
      const intermediary = corporate.agentId
        ? (agentLabelById[corporate.agentId] ?? corporate.agentId)
        : "";
      const businessClass = corporate.businessClass
        ? (businessClassLabelByCode[corporate.businessClass] ??
          corporate.businessClass)
        : "";

      return [
        corporate.corporate,
        corporate.corpId,
        corporate.policyNo,
        intermediary,
        businessClass,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [agentLabelById, businessClassLabelByCode, corporates, searchQuery]);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeCorporateModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("edit");
    params.delete("view");
    if (manageOpen) params.set("manage", "1");
    else params.delete("manage");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [manageOpen, pathname, router, searchParams]);

  const openNewModal = useCallback(() => {
    router.push(`${pathname}?manage=1&new=1`, { scroll: false });
  }, [pathname, router]);

  const openEditModal = useCallback(
    (id: string) => {
      router.push(`${pathname}?manage=1&edit=${id}`, { scroll: false });
    },
    [pathname, router]
  );

  const openViewModal = useCallback(
    (id: string) => {
      router.push(`${pathname}?manage=1&view=${id}`, { scroll: false });
    },
    [pathname, router]
  );

  const getCorporateHref = useCallback(
    (id: string, mode: "view" | "edit" = "view") =>
      `${pathname}?manage=1&${mode}=${id}`,
    [pathname]
  );

  const handleSaved = useCallback(() => {
    closeCorporateModal();
    router.refresh();
  }, [closeCorporateModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!detailId) {
      setDetailState(null);
      return;
    }

    let cancelled = false;
    setDetailState(null);

    fetch(`/api/medical/corporates/${detailId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load corporate");
        }
        return res.json();
      })
      .then((corporate) => {
        if (cancelled) return;
        setDetailState({
          id: detailId,
          corporate: corporateToFormValues(corporate),
          coverDates: corporate.coverAnniversary ?? null,
          contactPersons: corporate.contactPersons ?? [],
          categoryGroups: corporate.categoryGroups ?? [],
          providerRestrictions: corporate.providerRestrictions ?? [],
          premiumRates: corporate.premiumRates ?? [],
          name: corporate.corporate,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setDetailState({
          id: detailId,
          corporate: null,
          coverDates: null,
          contactPersons: [],
          categoryGroups: [],
          providerRestrictions: [],
          premiumRates: [],
          name: "",
          error:
            error instanceof Error ? error.message : "Failed to load corporate",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [detailId]);

  const detailLoading = Boolean(detailId && detailState?.id !== detailId);
  const detailCorporate =
    detailState?.id === detailId ? detailState.corporate : null;
  const detailCoverDates =
    detailState?.id === detailId ? detailState.coverDates : null;
  const detailContactPersons =
    detailState?.id === detailId ? detailState.contactPersons : [];
  const detailCategoryGroups =
    detailState?.id === detailId ? detailState.categoryGroups : [];
  const detailProviderRestrictions =
    detailState?.id === detailId ? detailState.providerRestrictions : [];
  const detailPremiumRates =
    detailState?.id === detailId ? detailState.premiumRates : [];
  const detailName = detailState?.id === detailId ? detailState.name : "";
  const detailError = detailState?.id === detailId ? detailState.error : "";

  const activeCorporate = detailId
    ? corporates.find((corporate) => corporate.id === detailId)
    : undefined;

  const corporatesTable = (
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
            <th className={thClass}>Intermediary</th>
            <th className={thClass}>Business Class</th>
            <th className={thClass}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredCorporates.length === 0 ? (
            <tr>
              <td colSpan={6} className={emptyCellClass}>
                {corporates.length === 0 ? (
                  <>
                    No corporates found.{" "}
                    <button
                      type="button"
                      onClick={openNewModal}
                      className="text-maroon hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  "No corporates match your search."
                )}
              </td>
            </tr>
          ) : (
            filteredCorporates.map((corporate) => (
              <tr key={corporate.id} className="bg-white hover:bg-slate-50">
                <td className={tdClass}>
                  <Link
                    href={getCorporateHref(corporate.id, "view")}
                    scroll={false}
                    className="font-semibold text-maroon hover:underline"
                  >
                    {corporate.corporate}
                  </Link>
                </td>
                <td className={tdClass}>{corporate.corpId ?? "—"}</td>
                <td className={tdClass}>{corporate.policyNo ?? "—"}</td>
                <td className={tdClass}>
                  {corporate.agentId
                    ? (agentLabelById[corporate.agentId] ?? corporate.agentId)
                    : "—"}
                </td>
                <td className={tdClass}>
                  {corporate.businessClass
                    ? (businessClassLabelByCode[corporate.businessClass] ??
                      corporate.businessClass)
                    : "—"}
                </td>
                <td className={tdClass}>
                  <CorporateActionsMenu
                    corporateName={corporate.corporate}
                    onAction={(action) => {
                      if (action === "view") openViewModal(corporate.id);
                      else openEditModal(corporate.id);
                    }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`relative ${modalOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={modalOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="Corporates"
          description="Open Corporate Management from the menu to view and edit accounts"
        />
      </div>

      <Modal
        open={manageOpen && !corporateModalOpen}
        onClose={closeManageModal}
        title="Corporate Management"
        description="Manage corporate accounts and their details"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search corporates"
              className="w-40 border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Corporate
            </Button>
          </div>
          {corporatesTable}
        </div>
      </Modal>

      <Modal
        open={corporateModalOpen}
        onClose={closeCorporateModal}
        title={
          isNew
            ? "New Corporate"
            : isViewMode
              ? "View Corporate"
              : "Edit Corporate"
        }
        description={
          isNew
            ? "Register a new corporate account"
            : detailName ||
              activeCorporate?.corporate ||
              (isViewMode
                ? "Corporate account details"
                : "Update corporate details")
        }
      >
        {isNew ? (
          <CorporateForm
            embedded
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            categoryOptions={categoryOptions}
            hospitalWardOptions={hospitalWardOptions}
            providerOptions={providerOptions}
            onSuccess={handleSaved}
            onCancel={closeCorporateModal}
          />
        ) : detailLoading ? (
          <p className="text-[11px] text-slate-500">Loading corporate...</p>
        ) : detailError ? (
          <p className="text-[11px] text-red-600">{detailError}</p>
        ) : detailCorporate && detailId ? (
          <CorporateForm
            key={`${isViewMode ? "view" : "edit"}-${detailId}-${detailName}`}
            embedded
            readOnly={isViewMode}
            corporateId={detailId}
            initial={detailCorporate}
            initialCoverDates={detailCoverDates ?? undefined}
            initialContactPersons={detailContactPersons}
            initialCategoryGroups={detailCategoryGroups}
            initialProviderRestrictions={detailProviderRestrictions}
            initialPremiumRates={detailPremiumRates}
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            categoryOptions={categoryOptions}
            hospitalWardOptions={hospitalWardOptions}
            providerOptions={providerOptions}
            onSuccess={handleSaved}
            onCancel={closeCorporateModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
