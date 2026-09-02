import React, { type ReactNode } from "react";
import { MdErrorOutline, MdRefresh } from "react-icons/md";
import Button from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data from the server. Please check your connection and try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-error/20 bg-error/5 my-4 ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-error/10 text-error mb-3 shadow-inner">
        <MdErrorOutline size={36} />
      </div>
      <h3 className="text-base font-bold text-error tracking-tight">{title}</h3>
      <p className="text-xs text-base-content/70 max-w-md mt-1 mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="error"
          size="sm"
          onClick={onRetry}
          leftIcon={<MdRefresh size={16} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
