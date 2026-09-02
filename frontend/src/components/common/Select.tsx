import React, { type SelectHTMLAttributes, type ReactNode, forwardRef } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  containerClassName?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      className = "",
      containerClassName = "",
      required,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`form-control w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="label py-1">
            <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
              {label} {required && <span className="text-error">*</span>}
            </span>
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`select select-bordered w-full rounded-xl bg-base-100 border-base-300 text-sm transition-all focus:outline-none focus:border-primary ${
            error ? "select-error border-error focus:border-error" : ""
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-error text-xs mt-1 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-base-content/50 text-xs mt-1">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
