"use client";

import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  defaultManageClaimsTab,
  manageClaimsTabs,
  type ManageClaimsTabId,
} from "@/features/medical/claims/manage/constants";
import { ManageClaimsTabSkeleton } from "./tabs/ManageClaimsTabSkeleton";

export function ManageClaimsPageClient() {
  const [activeTab, setActiveTab] = useState<ManageClaimsTabId>(
    defaultManageClaimsTab
  );

  const activeTabMeta =
    manageClaimsTabs.find((tab) => tab.id === activeTab) ?? manageClaimsTabs[0];

  return (
    <div>
      <PageHeader
        title="Manage Claims"
        description="Capture and update medical claims"
      />

      <div className="border border-slate-200 bg-white">
        <div
          role="tablist"
          aria-label="Manage claims sections"
          className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1"
        >
          {manageClaimsTabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`manage-claims-tab-${tab.id}`}
                aria-controls={`manage-claims-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-[11px] font-medium transition ${
                  selected
                    ? "bg-white text-maroon shadow-sm"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`manage-claims-panel-${activeTab}`}
          aria-labelledby={`manage-claims-tab-${activeTab}`}
          className="p-3 sm:p-4"
        >
          <ManageClaimsTabSkeleton title={activeTabMeta.label} />
        </div>
      </div>
    </div>
  );
}
