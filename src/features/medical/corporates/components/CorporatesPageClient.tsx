"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";

type CorporatesPageClientProps = {
  corporates: CorporateListItem[];
  agentOptions: LookupOption[];
  benefitOptions: LookupOption[];
  categoryOptions: LookupOption[];
  providerOptions: LookupOption[];
};

type EditCorporateState = {
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
  providerOptions,
}: CorporatesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const corporateModalOpen = isNew || Boolean(editId);
  const [searchQuery, setSearchQuery] = useState("");
  const modalOpen = manageOpen || corporateModalOpen;

  const [editState, setEditState] = useState<EditCorporateState | null>(null);

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

  const getEditCorporateHref = useCallback(
    (id: string) => `${pathname}?manage=1&edit=${id}`,
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
    if (!editId) {
      setEditState(null);
      return;
    }

    let cancelled = false;
    setEditState(null);

    fetch(`/api/medical/corporates/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load corporate");
        }
        return res.json();
      })
      .then((corporate) => {
        if (cancelled) return;
        setEditState({
          id: editId,
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
        setEditState({
          id: editId,
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
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editCorporate = editState?.id === editId ? editState.corporate : null;
  const editCoverDates = editState?.id === editId ? editState.coverDates : null;
  const editContactPersons =
    editState?.id === editId ? editState.contactPersons : [];
  const editCategoryGroups =
    editState?.id === editId ? editState.categoryGroups : [];
  const editProviderRestrictions =
    editState?.id === editId ? editState.providerRestrictions : [];
  const editPremiumRates =
    editState?.id === editId ? editState.premiumRates : [];
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingCorporate = editId
    ? corporates.find((corporate) => corporate.id === editId)
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
            <th className={thClass}>Actions</th>
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
                    href={getEditCorporateHref(corporate.id)}
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
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditModal(corporate.id)}
                  >
                    Edit Corporate
                  </Button>
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
        open={manageOpen}
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
              className="w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
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
        title={isNew ? "New Corporate" : "Edit Corporate"}
        description={
          isNew
            ? "Register a new corporate account"
            : editName ||
              editingCorporate?.corporate ||
              "Update corporate details"
        }
      >
        {isNew ? (
          <CorporateForm
            embedded
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            categoryOptions={categoryOptions}
            providerOptions={providerOptions}
            onSuccess={handleSaved}
            onCancel={closeCorporateModal}
          />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading corporate...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editCorporate && editId ? (
          <CorporateForm
            key={`${editId}-${editName}`}
            embedded
            corporateId={editId}
            initial={editCorporate}
            initialCoverDates={editCoverDates ?? undefined}
            initialContactPersons={editContactPersons}
            initialCategoryGroups={editCategoryGroups}
            initialProviderRestrictions={editProviderRestrictions}
            initialPremiumRates={editPremiumRates}
            agentOptions={agentOptions}
            benefitOptions={benefitOptions}
            categoryOptions={categoryOptions}
            providerOptions={providerOptions}
            onSuccess={handleSaved}
            onCancel={closeCorporateModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
