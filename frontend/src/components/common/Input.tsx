import React, { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      containerClassName = "",
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`form-control w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="label py-1">
            <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
              {label} {required && <span className="text-error">*</span>}
            </span>
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-base-content/40 pointer-events-none shrink-0">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`input input-bordered w-full rounded-xl bg-base-100 border-base-300 text-sm transition-all focus:outline-none focus:border-primary ${
              leftIcon ? "pl-9" : ""
            } ${rightIcon ? "pr-9" : ""} ${
              error ? "input-error border-error focus:border-error" : ""
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-base-content/40 shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-error text-xs mt-1 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-base-content/50 text-xs mt-1">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
