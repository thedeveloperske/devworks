"use client";

import type { ChangeEvent } from "react";

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  name: string;
  label?: string;
  value: string;
  options: RadioOption[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  labelClassName?: string;
  disabled?: boolean;
};

export function RadioGroup({
  name,
  label,
  value,
  options,
  onChange,
  labelClassName = "mb-0.5 block text-[12px] font-medium text-slate-700",
  disabled = false,
}: RadioGroupProps) {
  return (
    <div>
      {label ? <span className={labelClassName}>{label}</span> : null}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex min-h-[30px] flex-wrap items-center gap-x-3 gap-y-1"
      >
        {options.map((option) => {
          const checked = value === option.value;
          const optionId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`inline-flex items-center gap-2 text-[12px] font-medium ${
                disabled
                  ? "cursor-not-allowed text-slate-500"
                  : checked
                    ? "cursor-pointer text-maroon"
                    : "cursor-pointer text-slate-700"
              }`}
            >
              <span className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={checked}
                  disabled={disabled}
                  onChange={onChange}
                  className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
                <span
                  aria-hidden
                  className={`pointer-events-none flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors peer-focus-visible:border-maroon peer-focus-visible:ring-1 peer-focus-visible:ring-maroon ${
                    checked
                      ? "border-maroon bg-white"
                      : "border-slate-300 bg-white"
                  } ${disabled ? "opacity-50" : ""}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      checked ? "bg-maroon" : "bg-transparent"
                    }`}
                  />
                </span>
              </span>
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
