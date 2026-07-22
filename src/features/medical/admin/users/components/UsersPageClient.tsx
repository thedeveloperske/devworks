"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  statusLabel,
  systemsLabel,
  userToFormValues,
  type UserFormData,
  type UserListItem,
} from "@/features/medical/admin/users";
import { UserForm } from "./UserForm";
import {
  tableClass,
  tableHeadClass,
  tableWrapperClass,
} from "@/lib/form-styles";

type UsersPageClientProps = {
  users: UserListItem[];
};

type EditUserState = {
  id: string;
  user: UserFormData | null;
  name: string;
  error: string;
};

const compactThClass =
  "whitespace-nowrap px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500";
const compactTdClass =
  "whitespace-nowrap border-b border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2.5 py-4 text-center text-[12px] text-slate-500";
const searchInputClass =
  "w-44 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

export function UsersPageClient({ users }: UsersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const manageOpen = searchParams.get("manage") === "1";
  const userModalOpen = isNew || Boolean(editId);
  const modalOpen = manageOpen || userModalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [editState, setEditState] = useState<EditUserState | null>(null);

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  const closeUserModal = useCallback(() => {
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
    closeUserModal();
    router.refresh();
  }, [closeUserModal, router]);

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
    setEditState({ id: editId, user: null, name: "", error: "" });

    fetch(`/api/medical/users/${editId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load user");
        }
        return res.json();
      })
      .then((user) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          user: userToFormValues(user),
          name: user.fullName || user.username || editId,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEditState({
          id: editId,
          user: null,
          name: "",
          error: error instanceof Error ? error.message : "Failed to load user",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      user.username,
      user.fullName,
      user.department,
      user.status,
      ...user.allowedSystems,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className={`relative ${modalOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={modalOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="User Management"
          description="Create and manage system login users"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="User Management"
        description="Manage users who can sign in to Promed"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-center justify-end gap-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className={searchInputClass}
            />
            <Button type="button" size="sm" onClick={openNewModal}>
              New User
            </Button>
          </div>
          <div className={`${tableWrapperClass} min-h-0 flex-1 overflow-y-auto`}>
            <table className={tableClass}>
              <thead className={`${tableHeadClass} sticky top-0 z-10`}>
                <tr>
                  <th className={compactThClass}>Username</th>
                  <th className={compactThClass}>Full Name</th>
                  <th className={compactThClass}>Department</th>
                  <th className={compactThClass}>Systems</th>
                  <th className={compactThClass}>Status</th>
                  <th className={`${compactThClass} w-20`} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={emptyCellClass}>
                      {users.length === 0 ? "No users yet." : "No users match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50">
                      <td className={compactTdClass}>
                        <span className="font-semibold text-slate-900">
                          {user.username ?? "—"}
                        </span>
                      </td>
                      <td className={compactTdClass}>{user.fullName ?? "—"}</td>
                      <td className={compactTdClass}>{user.department ?? "—"}</td>
                      <td className={compactTdClass}>{systemsLabel(user.allowedSystems)}</td>
                      <td className={compactTdClass}>{statusLabel(user.status)}</td>
                      <td className={compactTdClass}>
                        <button
                          type="button"
                          onClick={() => openEditModal(user.id)}
                          className="text-[12px] font-semibold text-maroon hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <Modal
        open={userModalOpen}
        onClose={closeUserModal}
        variant="popup"
        size="lg"
        title={isNew ? "New User" : "Edit User"}
        description={
          isNew
            ? "Create a login account"
            : editState?.name
              ? `Update ${editState.name}`
              : "Update user account"
        }
      >
        {isNew ? (
          <UserForm embedded onSuccess={handleSaved} onCancel={closeUserModal} />
        ) : editId && editState?.id === editId ? (
          editState.error ? (
            <p className="text-[12px] text-red-600">{editState.error}</p>
          ) : editState.user ? (
            <UserForm
              key={editId}
              embedded
              userId={editId}
              initial={editState.user}
              onSuccess={handleSaved}
              onCancel={closeUserModal}
            />
          ) : (
            <p className="text-[12px] text-slate-500">Loading user...</p>
          )
        ) : null}
      </Modal>
    </div>
  );
}
