import React, { type ReactNode } from "react";
import { MdInbox } from "react-icons/md";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title = "No data found",
  description = "There are no items matching your criteria at this time.",
  actionText,
  onAction,
  actionIcon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-base-300 bg-base-100/50 my-4 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-base-200/60 text-base-content/40 mb-3.5 shadow-inner">
        {icon || <MdInbox size={40} />}
      </div>
      <h3 className="text-base font-bold text-base-content tracking-tight">{title}</h3>
      <p className="text-xs text-base-content/60 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} leftIcon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
