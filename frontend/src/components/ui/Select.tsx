import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";
import { fieldSizeClasses } from "./sizes";
import type { FieldSize } from "./sizes";


interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  size?: FieldSize;
}

export default function Select({
  size = "md",
  className,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
     className={clsx(
  " select w-full text-base-content/70 rounded-lg border border-base-300 bg-base-100 transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none",
  fieldSizeClasses[size],
  className
)}
    />
  );
}
