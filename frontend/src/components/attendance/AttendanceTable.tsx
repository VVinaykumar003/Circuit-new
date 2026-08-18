import { useState, useEffect } from "react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import type { AttendanceRecord, UserRole } from "../../type/attendance";
import Table from "../ui/Table";
import { useAuth } from "@/auth/AuthContext";
import { approveAttendance } from "@/services/attendanceService";
import { toast } from "react-toastify";
// import { useNotificationSocket } from '@/hooks/notifiaction';
import Pagination from "../ui/Pagination";
interface Props {
  records: (AttendanceRecord & {
    attendanceDocId: string;
    employeeId: string;
    mode?: string;
  })[];
  role: UserRole;
  onUpdate: () => void;
  showActions?: boolean; // New prop to control action visibility
}

export default function AttendanceTable({
  records,
  role,
  onUpdate,
  showActions,
}: Props) {
  const isAdmin = (role === "admin" || role === "owner") && showActions;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { auth } = useAuth();

  /* ---------------- PAGINATION ---------------- */
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(page, totalPages);

  const paginatedRecords = records.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE,
  );

  // Reset page when filtering changes the total record count
  useEffect(() => {
    setPage(1);
  }, [records.length]);

  const handleApproval = async (
    attendanceDocId: string,
    employeeId: string,
    status: "PRESENT" | "ABSENT",
  ) => {
    if (!auth?.slug) return;
    await toast.promise(
      approveAttendance(auth.slug, attendanceDocId, { employeeId, status }),
      {
        pending: "Updating status...",
        success: "Status updated!",
        error: "Update failed.",
      },
    );

    onUpdate();
  };

  const selectableRecords = paginatedRecords.filter(
    (r) => r.status === "pending",
  );

  const allSelected =
    selectableRecords.length > 0 &&
    selectableRecords.every((r) => selectedIds.includes(r.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : selectableRecords.map((r) => r.id));
  };

  const handleBulkAction = async (status: "PRESENT" | "ABSENT") => {
    if (!auth?.slug) return;
    const selectedRecords = paginatedRecords.filter((r) =>
      selectedIds.includes(r.id),
    );

    const promises = selectedRecords.map((rec) =>
      approveAttendance(auth.slug!, rec.attendanceDocId, {
        employeeId: rec.employeeId,
        status,
      }),
    );

    await toast.promise(Promise.all(promises), {
      pending: `Updating ${promises.length} records...`,
      success: `${promises.length} records updated successfully!`,
      error: "Some updates failed. Please review.",
    });
    onUpdate();
    setSelectedIds([]);
  };

  return (
    <div className="bg-base-100  rounded-lg overflow-hidden text-sm scale-[0.98] ">
      <div className="overflow-x-auto rounded-lg">
        {/* ✅ Bulk Action Bar (ADMIN ONLY) */}
        {isAdmin && selectedIds.length > 0 && (
          <div className="sticky bottom-0 z-10 bg-base-200 border-t border-base-300 px-3 py-2 text-sm flex justify-between items-center">
            <span className="text-sm">{selectedIds.length} selected</span>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => handleBulkAction("PRESENT")}
              >
                PRESENT
              </Button>
              <Button
                variant="error"
                onClick={() => handleBulkAction("ABSENT")}
              >
                ABSENT
              </Button>
            </div>
          </div>
        )}

        <Table
          // headers={[
          //   ...(isAdmin
          //     ? [
          //         <div className="w-10">
          //           <input
          //             type="checkbox"
          //             className="checkbox checkbox-sm rounded"
          //             checked={allSelected}
          //             disabled={selectableRecords.length === 0}
          //             onChange={toggleSelectAll}
          //           />
          //         </div>,
          //       ]
          //     : []),
          //   "Employee",
          //   "Date",
          //   "Check In",
          //   "Status",
          //   "Mode",
          //   ...(isAdmin ? ["Action"] : []),
          // ]}
          headers={[
            "Employee",
            "Date",
            "Check In",
            "Status",
            "Mode",
            ...(isAdmin ? ["Action"] : []),
            ...(isAdmin
              ? [
                  <div className="w-10">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-white border-2 rounded
                      bg-white   checked:bg-white checked:border-primary"
                      checked={allSelected}
                      disabled={selectableRecords.length === 0}
                      onChange={toggleSelectAll}
                    />
                  </div>,
                ]
              : []),
          ]}
        >
          {paginatedRecords.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 7 : 5}
                className="text-center py-10 text-base-content/60 font-medium"
              >
                No attendance records found
              </td>
            </tr>
          ) : (
            paginatedRecords.map((r) => (
              <tr className="divide-x divide-primary/10 text-base-content text-sm " key={r.id} >
                {/* ✅ Checkbox only for admin */}

                <td >{r.employee}</td>
                <td >{r.date}</td>
                <td  >{r.checkIn}</td>

                <td >
                  <StatusBadge status={r.status} />
                </td>
                <td className=" capitalize">{r.mode}</td>

                {/* ✅ Action column only for admin */}
                {isAdmin && (
                  <td>
                    <div className="flex justify-start gap-2">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() =>
                          handleApproval(
                            r.attendanceDocId,
                            r.employeeId,
                            "PRESENT",
                          )
                        }
                        className={`${r.status === "approved" ? "btn-disabled" : ""} `}
                      >
                        Present
                      </Button>
                      <Button
                        size="xs"
                        variant="error"
                        onClick={() =>
                          handleApproval(
                            r.attendanceDocId,
                            r.employeeId,
                            "ABSENT",
                          )
                        }
                        className={`${r.status === "absent" ? "btn-disabled" : ""}`}
                      >
                        Absent
                      </Button>
                    </div>

                    {/* {r.status === "absent" && (
                  <div className="flex justify-start gap-2">
                    <Button size="xs" variant="primary" onClick={() => handleApproval(r.attendanceDocId, r.employeeId, "PRESENT")}>
                      Present
                    </Button>
                  </div>
                )}
                {r.status === "approved" && (
                  <div className="flex justify-start gap-2">
                    <Button size="xs" variant="error" className="text-base-content" onClick={() => handleApproval(r.attendanceDocId, r.employeeId, "ABSENT")}>
                     Absent
                    </Button>
                  </div>
                )} */}
                  </td>
                )}
                {isAdmin && (
                  <td className="w-10">
                    <input
                      type="checkbox"
                      className=" checkbox 
                      bg-white checkbox-xs rounded border-2 checked:bg-white checked:border-primary"
                      checked={selectedIds.includes(r.id)}
                      disabled={r.status !== "pending"}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </Table>
      </div>

      <div className="flex justify-center sm:justify-end p-4 border-t border-base-300">
        <Pagination
          currentPage={validPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
