"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import type { ManageClaimsListItem } from "@/features/medical/claims/manage/types";
import type { LookupOption } from "@/features/medical/lookups/types";
import { ManageClaimsForm } from "./ManageClaimsForm";

const tableBodyMaxHeight = 280;
const tableMinWidth = 720;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[11px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[11px] text-slate-500";

type ManageClaimsPageClientProps = {
  claims?: ManageClaimsListItem[];
  providerOptions?: LookupOption[];
};

export function ManageClaimsPageClient({
  claims = [],
  providerOptions = [],
}: ManageClaimsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const claimModalOpen = isNew || Boolean(editId);
  const [searchQuery, setSearchQuery] = useState("");
  const modalOpen = manageOpen || claimModalOpen;

  const filteredClaims = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return claims;

    return claims.filter((claim) =>
      [
        claim.claimNo,
        claim.memberNo,
        claim.memberName,
        claim.providerName,
        claim.claimDate,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [claims, searchQuery]);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeClaimModal = useCallback(() => {
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

  const getEditClaimHref = useCallback(
    (id: string) => `${pathname}?manage=1&edit=${id}`,
    [pathname]
  );

  const handleSaved = useCallback(() => {
    closeClaimModal();
    router.refresh();
  }, [closeClaimModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  const editingClaim = editId
    ? claims.find((claim) => claim.id === editId)
    : undefined;

  const claimsTable = (
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
            <th className={thClass}>Claim No</th>
            <th className={thClass}>Member No</th>
            <th className={thClass}>Member Name</th>
            <th className={thClass}>Provider</th>
            <th className={thClass}>Claim Date</th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClaims.length === 0 ? (
            <tr>
              <td colSpan={6} className={emptyCellClass}>
                {claims.length === 0 ? (
                  <>
                    No claims found.{" "}
                    <button
                      type="button"
                      onClick={openNewModal}
                      className="text-maroon hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  "No claims match your search."
                )}
              </td>
            </tr>
          ) : (
            filteredClaims.map((claim) => (
              <tr key={claim.id} className="bg-white hover:bg-slate-50">
                <td className={tdClass}>
                  <Link
                    href={getEditClaimHref(claim.id)}
                    scroll={false}
                    className="font-semibold text-maroon hover:underline"
                  >
                    {claim.claimNo}
                  </Link>
                </td>
                <td className={tdClass}>{claim.memberNo || "—"}</td>
                <td className={tdClass}>{claim.memberName || "—"}</td>
                <td className={tdClass}>{claim.providerName || "—"}</td>
                <td className={tdClass}>{claim.claimDate || "—"}</td>
                <td className={tdClass}>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditModal(claim.id)}
                  >
                    Edit Claim
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
          title="Manage Claims"
          description="Open Manage Claims from the menu to view and edit claims"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Manage Claims"
        description="Manage medical claims and their details"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search claims"
              className="w-40 border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Claim
            </Button>
          </div>
          {claimsTable}
        </div>
      </Modal>

      <Modal
        open={claimModalOpen}
        onClose={closeClaimModal}
        title={isNew ? "New Claim" : "Edit Claim"}
        description={
          isNew
            ? "Capture a new medical claim"
            : editingClaim?.claimNo || "Update claim details"
        }
      >
        {isNew ? (
          <ManageClaimsForm
            embedded
            providerOptions={providerOptions}
            onSuccess={handleSaved}
            onCancel={closeClaimModal}
          />
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
