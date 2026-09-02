import React from "react";

export interface LoadingSkeletonProps {
  rows?: number;
  type?: "table" | "cards" | "detail" | "text";
  className?: string;
}

export default function LoadingSkeleton({
  rows = 5,
  type = "table",
  className = "",
}: LoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs space-y-3 animate-pulse"
          >
            <div className="h-4 bg-base-300 rounded-md w-1/2"></div>
            <div className="h-8 bg-base-300 rounded-md w-3/4"></div>
            <div className="h-3 bg-base-300 rounded-md w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className={`p-6 space-y-6 bg-base-100 rounded-2xl border border-base-300 animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-base-300"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-base-300 rounded-md w-1/3"></div>
            <div className="h-4 bg-base-300 rounded-md w-1/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-base-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-base-300 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-base-100 rounded-xl border border-base-300 p-4 space-y-3 animate-pulse ${className}`}>
      <div className="h-9 bg-base-200 rounded-lg w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-5 bg-base-300 rounded-md flex-1"></div>
          <div className="h-5 bg-base-300 rounded-md flex-1"></div>
          <div className="h-5 bg-base-300 rounded-md flex-1"></div>
          <div className="h-5 bg-base-300 rounded-md w-20"></div>
        </div>
      ))}
    </div>
  );
}
