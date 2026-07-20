"use client";

import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

type FieldOption = {
  value: string;
  label: string;
};

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  type?: HTMLInputTypeAttribute;
  as?: "input" | "textarea" | "select";
  rows?: number;
  options?: FieldOption[];
  labelClassName?: string;
  inputClassName?: string;
  selectClassName?: string;
  disabled?: boolean;
};

export function FormField({
  id,
  name,
  label,
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
  type = "text",
  as = "input",
  rows = 3,
  options = [],
  labelClassName = "mb-1.5 block text-[12px] font-medium text-slate-700",
  inputClassName = "w-full border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none",
  selectClassName,
  disabled = false,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName}
        />
      ) : as === "select" ? (
        <select
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClassName ?? inputClassName}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName}
        />
      )}
    </div>
  );
}
