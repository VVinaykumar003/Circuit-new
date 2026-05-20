import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        text-center
        border border-dashed border-base-300
        rounded-xl
        p-10
        bg-base-200
      "
    >
      <h3 className="font-semibold text-base-content">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-base-content/60 mt-1 max-w-sm">
          {description}
        </p>
      )}

      {/* Default Action Button */}
      {actionLabel && onAction && (
        <button
          className="btn btn-primary btn-sm mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}

      {/* Custom Action (Optional) */}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
