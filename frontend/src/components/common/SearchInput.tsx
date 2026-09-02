import React, { forwardRef, type InputHTMLAttributes } from "react";
import { MdSearch, MdClose } from "react-icons/md";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = "Search...", className = "", containerClassName = "", ...props }, ref) => {
    return (
      <div className={`relative flex items-center w-full ${containerClassName}`}>
        <MdSearch className="absolute left-3 text-base-content/40 pointer-events-none" size={18} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input input-sm input-bordered w-full pl-9 pr-8 rounded-xl bg-base-100 border-base-300 text-sm focus:outline-none focus:border-primary transition-all ${className}`}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
          >
            <MdClose size={14} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
export default SearchInput;
