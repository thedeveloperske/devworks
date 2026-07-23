"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentForm } from "./AgentForm";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { agentToFormValues, type AgentFormData, type AgentListItem } from "@/features/medical/admin/agents";
import { branchOptions } from "@/features/medical/lookups";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type AgentsPageClientProps = {
  agents: AgentListItem[];
};

type EditAgentState = {
  id: string;
  agent: AgentFormData | null;
  name: string;
  error: string;
};

export function AgentsPageClient({ agents }: AgentsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const agentModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || agentModalOpen;
  const [searchQuery, setSearchQuery] = useState("");

  const [editState, setEditState] = useState<EditAgentState | null>(null);

  const branchLabelById = useMemo(
    () => Object.fromEntries(branchOptions.map((option) => [option.value, option.label])),
    []
  );

  const filteredAgents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return agents;

    return agents.filter((agent) => {
      const branch = agent.branch
        ? (branchLabelById[agent.branch] ?? agent.branch)
        : "";

      return [
        agent.agentName,
        agent.mobileNo,
        agent.email,
        agent.contactPerson,
        agent.telNo,
        agent.pinNumber,
        branch,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [agents, branchLabelById, searchQuery]);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeAgentModal = useCallback(() => {
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

  const handleSaved = useCallback(() => {
    closeAgentModal();
    router.refresh();
  }, [closeAgentModal, router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!editId) {
      return;
    }

    let cancelled = false;

    fetch(`/api/medical/agents/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load agent");
        }
        return res.json();
      })
      .then((agent) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          agent: agentToFormValues(agent),
          name: agent.agentName,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          agent: null,
          name: "",
          error: error instanceof Error ? error.message : "Failed to load agent",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const editLoading = Boolean(editId && editState?.id !== editId);
  const editAgent = editState?.id === editId ? editState.agent : null;
  const editName = editState?.id === editId ? editState.name : "";
  const editError = editState?.id === editId ? editState.error : "";

  const editingAgent = editId ? agents.find((agent) => agent.id === editId) : undefined;

  const compactThClass =
    "px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
  const compactTdClass = "px-2.5 py-1.5 text-[12px] text-slate-600";
  const compactEmptyCellClass = "px-2.5 py-4 text-center text-[12px] text-slate-500";

  const agentsTable = (
    <div className={`${tableWrapperClass} overflow-y-auto`}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className={compactThClass}>Agent Name</th>
            <th className={compactThClass}>Mobile</th>
            <th className={compactThClass}>Email</th>
            <th className={compactThClass}>Contact Person</th>
            <th className={compactThClass}>Branch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredAgents.length === 0 ? (
            <tr>
              <td colSpan={5} className={compactEmptyCellClass}>
                {agents.length === 0 ? (
                  <>
                    No agents found.{" "}
                    <button
                      type="button"
                      onClick={openNewModal}
                      className="text-maroon hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  "No agents match your search."
                )}
              </td>
            </tr>
          ) : (
            filteredAgents.map((agent) => (
              <tr key={agent.id} className="transition-colors hover:bg-slate-50">
                <td className={compactTdClass}>
                  <button
                    type="button"
                    onClick={() => openEditModal(agent.id)}
                    className="text-left font-semibold text-slate-900 hover:text-maroon"
                  >
                    {agent.agentName}
                  </button>
                </td>
                <td className={compactTdClass}>{agent.mobileNo ?? "—"}</td>
                <td className={compactTdClass}>{agent.email ?? "—"}</td>
                <td className={compactTdClass}>{agent.contactPerson ?? "—"}</td>
                <td className={compactTdClass}>
                  {agent.branch ? (branchLabelById[agent.branch] ?? agent.branch) : "—"}
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
          title="Agents"
          description="Open Agent Management from the menu to view and edit intermediaries"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Agent Management"
        description="Manage intermediaries and their contact details"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search agents"
              className="w-40 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              Add Agent
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{agentsTable}</div>
        </div>
      </Modal>

      <Modal
        open={agentModalOpen}
        onClose={closeAgentModal}
        title={isNew ? "New Agent" : "Edit Agent"}
        description={
          isNew
            ? "Register a new intermediary"
            : editName || editingAgent?.agentName || "Update agent details"
        }
      >
        {isNew ? (
          <AgentForm embedded onSuccess={handleSaved} onCancel={closeAgentModal} />
        ) : editLoading ? (
          <p className="text-[12px] text-slate-500">Loading agent...</p>
        ) : editError ? (
          <p className="text-[12px] text-red-600">{editError}</p>
        ) : editAgent && editId ? (
          <AgentForm
            key={editId}
            embedded
            agentId={editId}
            initial={editAgent}
            onSuccess={handleSaved}
            onCancel={closeAgentModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
