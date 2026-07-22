"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import {
  defaultUserForm,
  USER_STATUS_OPTIONS,
  type UserFormData,
} from "@/features/medical/admin/users";
import { labelClass } from "@/lib/form-styles";

type UserFormProps = {
  userId?: string;
  initial?: Partial<UserFormData>;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const compactInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

export function UserForm({
  userId,
  initial,
  embedded = false,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<UserFormData>({
    ...defaultUserForm(),
    ...initial,
  });

  const isEdit = Boolean(userId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = userId
      ? `/api/medical/users/${userId}`
      : "/api/medical/users";
    const method = userId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    onSuccess?.();
  };

  const formClassName = embedded
    ? "flex h-full min-h-0 flex-col"
    : "max-w-xl space-y-5 border border-slate-200 bg-white p-6";

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <div className={embedded ? "min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" : "space-y-3"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            id="username"
            name="username"
            label="Username"
            required
            value={form.username}
            onChange={handleChange}
            autoComplete="off"
            labelClassName={labelClass}
            inputClassName={compactInputClass}
          />
          <FormField
            id="fullName"
            name="fullName"
            label="Full Name"
            required
            value={form.fullName}
            onChange={handleChange}
            labelClassName={labelClass}
            inputClassName={compactInputClass}
          />
          <FormField
            id="password"
            name="password"
            label={isEdit ? "Password (leave blank to keep)" : "Password"}
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            labelClassName={labelClass}
            inputClassName={compactInputClass}
          />
          <FormField
            id="department"
            name="department"
            label="Department"
            type="number"
            value={form.department}
            onChange={handleChange}
            labelClassName={labelClass}
            inputClassName={compactInputClass}
          />
          <FormField
            id="status"
            name="status"
            label="Status"
            as="select"
            required
            value={form.status}
            onChange={handleChange}
            options={[...USER_STATUS_OPTIONS]}
            labelClassName={labelClass}
            inputClassName={compactInputClass}
          />
        </div>
      </div>

      {error ? <FormError message={error} className="mt-3 shrink-0" /> : null}

      <div
        className={
          embedded
            ? "mt-3 flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-3"
            : "flex justify-end gap-2 pt-2"
        }
      >
        {onCancel ? (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
