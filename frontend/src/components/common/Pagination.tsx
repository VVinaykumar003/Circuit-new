import React from "react";
import Button from "./Button";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 text-xs text-base-content/70 border-t border-base-200 bg-base-100 ${className}`}
    >
      {totalItems !== undefined ? (
        <span className="font-medium">
          Showing{" "}
          <strong className="text-base-content">
            {Math.min(totalItems, (currentPage - 1) * (pageSize || 10) + 1)}
          </strong>{" "}
          to{" "}
          <strong className="text-base-content">
            {Math.min(totalItems, currentPage * (pageSize || 10))}
          </strong>{" "}
          of <strong className="text-base-content">{totalItems}</strong> entries
        </span>
      ) : (
        <span className="font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>
      )}

      <div className="flex items-center gap-3">
        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="select select-bordered select-xs rounded-lg bg-base-200"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="join">
          <Button
            variant="outline"
            size="xs"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="join-item rounded-l-lg border-base-300"
          >
            <MdChevronLeft size={16} /> Prev
          </Button>

          <span className="join-item btn btn-xs btn-ghost no-animation border border-base-300 font-semibold">
            {currentPage} / {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="xs"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="join-item rounded-r-lg border-base-300"
          >
            Next <MdChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
