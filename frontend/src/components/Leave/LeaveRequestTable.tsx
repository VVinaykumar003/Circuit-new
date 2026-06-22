import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import type { LeaveRequest } from "@/type/leave";
import { leaveTypeIcon } from "@/type/leave";
import { useState } from "react";
import Pagination from "@/components/ui/Pagination";

interface Props {
  requests: LeaveRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onBulkReject?: (ids: string[]) => void;
  mode?: "action" | "history";
  onRowClick?: (leave: LeaveRequest) => void;
}

export default function LeaveRequestTable({
  requests,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
  mode = "action",
  onRowClick,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(requests.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const currentRequests = requests.slice(
    (validPage - 1) * pageSize,
    validPage * pageSize,
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(requests.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkApprove = () => {
    if (onBulkApprove) {
      onBulkApprove(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkReject = () => {
    if (onBulkReject) {
      onBulkReject(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <>
      {/* {mode === "action" && selectedIds.length > 0 && (
        <div className="flex gap-2 mb-4 bg-base-200 p-3 rounded-lg items-center justify-between">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={handleBulkApprove}>
              Approve Selected
            </Button>
            <Button size="sm" variant="error" onClick={handleBulkReject}>
              Reject Selected
            </Button>
          </div>
        </div>
      )} */}

      {mode === "action" && selectedIds.length > 0 && (
  <div className="mb-4 flex flex-col gap-3 rounded-lg bg-base-200 p-3 sm:flex-row sm:items-center sm:justify-between">
    
    <span className="text-sm font-medium text-center sm:text-left">
      {selectedIds.length} selected
    </span>

    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        size="sm"
        variant="primary"
        onClick={handleBulkApprove}
        className="w-full sm:w-auto"
      >
        Approve Selected
      </Button>

      <Button
        size="sm"
        variant="error"
        onClick={handleBulkReject}
        className="w-full text-white sm:w-auto"
      >
        Reject Selected
      </Button>
    </div>
  </div>
)}

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-base-100 border border-primary/35 rounded-lg overflow-hidden">
        <table className="table table-zebra w-full text-base-content ">
          <thead>
            <tr className="bg-primary text-primary-content text-md">
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Status</th>
              {mode === "action" && <th className="text-right">Action</th>}
              {mode === "action" && (
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === requests.length &&
                      requests.length > 0
                    }
                    onChange={handleSelectAll}
                    className="checkbox bg-white/40 checkbox-sm checkbox-base-content-300 border"
                  />
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {currentRequests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-base-content/60 font-medium"
                >
                  No leave requests found
                </td>
              </tr>
            ) : (
              currentRequests.map((r) => {
                const Icon = leaveTypeIcon[r.type];
                return (
                  <tr
                    key={r.id}
                    onClick={() => onRowClick?.(r)}
                    className="hover:bg-base-200 cursor-pointer text-sm"
                  >
                    <td className="font-medium">{r.employee}</td>

                    <td className="flex items-center gap-2">
                      <Icon />
                      <span className="capitalize">{r.type}</span>
                    </td>

                    <td className="whitespace-nowrap">
                      <span className="font-medium">
                        {formatDate(r.fromDate)}
                      </span>
                      {r.toDate && (
                        <span className="font-medium">
                          {" "}
                          - {formatDate(r.toDate)}
                        </span>
                      )}
                    </td>

                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    {mode === "action" && (
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => onApprove?.(r.id)}
                            disabled={r.status === "approved"}
                            className={
                              r.status === "approved"
                                ? " cursor-not-allowed"
                                : ""
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="error"
                            onClick={() => onReject?.(r.id)}
                            disabled={r.status === "rejected"}
                            className={
                              r.status === "rejected"
                                ? " cursor-not-allowed"
                                : "text-white"
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    )}
                    {mode === "action" && (
                      <td className="font-medium">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={(e) => handleSelectOne(e, r.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="checkbox checkbox-sm bg-primary/10 border checkbox-base-content-300 "
                        />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
     


<div className="md:hidden space-y-4">
  {currentRequests.length === 0 ? (
    <div
      className="
        text-center
        py-10
        px-4
        text-base-content/60
        font-medium
        bg-base-100
        border
        border-base-300
        rounded-2xl
      "
    >
      No leave requests found
    </div>
  ) : (
    currentRequests.map((r) => {
      const Icon = leaveTypeIcon[r.type];

      return (
        <div
          key={r.id}
          onClick={() => onRowClick?.(r)}
          className="
            cursor-pointer
            bg-base-100
            border
            border-primary/20
            rounded-2xl
            p-4
            shadow-sm
            active:scale-[0.98]
            transition-all
            duration-200
            space-y-4
          "
        >
          {/* TOP */}
          <div className="flex items-start justify-between gap-3">
            
            {/* LEFT */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              
              {mode === "action" && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleSelectOne(e, r.id)
                  }
                  className="
                    checkbox
                    checkbox-sm
                    mt-1
                    shrink-0
                    bg-primary/40
                    border-primary
                    checkbox-primary
                  "
                />
              )}

              <div className="min-w-0 flex-1">
                <p
                  className="
                    font-semibold
                    text-sm
                    sm:text-base
                    text-base-content
                    break-words
                  "
                >
                  {r.employee}
                </p>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mt-1
                    text-xs
                    sm:text-sm
                    text-base-content/60
                  "
                >
                  <Icon className="shrink-0" />

                  <span className="capitalize truncate">
                    {r.type}
                  </span>
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="shrink-0">
              <StatusBadge status={r.status} />
            </div>
          </div>

          {/* DATE */}
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-1
              text-xs
              sm:text-sm
              text-base-content/70
              font-medium
            "
          >
            <span>{formatDate(r.fromDate)}</span>

            {r.toDate && (
              <>
                <span>→</span>
                <span>{formatDate(r.toDate)}</span>
              </>
            )}
          </div>

          {/* ACTIONS */}
       {/* ACTIONS */}
{mode === "action" && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="flex gap-3 pt-2"
  >
    <Button
      className={`
        flex-1
        min-w-0
        ${
          r.status === "approved"
            ? "opacity-70 cursor-not-allowed text-base-content/50"
            : "text-white"
        }
      `}
      size="sm"
      variant="primary"
      onClick={(e) => {
        e.stopPropagation();
        onApprove?.(r.id);
      }}
      disabled={r.status === "approved"}
    >
      <span className="truncate">Approve</span>
    </Button>

    <Button
      className={`
        flex-1
        min-w-0
        ${
          r.status === "rejected"
            ? "opacity-70 cursor-not-allowed text-base-content/50"
            : "text-white"
        }
      `}
      size="sm"
      variant="error"
      onClick={(e) => {
        e.stopPropagation();
        onReject?.(r.id);
      }}
      disabled={r.status === "rejected"}
    >
      <span className="truncate">Reject</span>
    </Button>
  </div>
)}
        </div>
      );
    })
  )}
</div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
}
