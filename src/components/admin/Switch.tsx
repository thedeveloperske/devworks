"use client";

import type { ChangeEvent } from "react";

type SwitchProps = {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export function Switch({
  id,
  name,
  checked,
  onChange,
  label,
  labelClassName = "mb-1.5 block text-[12px] font-medium text-slate-700",
  disabled = false,
}: SwitchProps) {
  const toggle = () => {
    if (disabled) return;
    const synthetic = {
      target: { name, value: checked ? "0" : "1" },
    } as ChangeEvent<HTMLInputElement>;
    onChange(synthetic);
  };

  return (
    <div>
      {label ? <span className={labelClassName}>{label}</span> : null}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={toggle}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
          checked ? "border-maroon bg-maroon" : "border-slate-300 bg-slate-200"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <span
          aria-hidden
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
