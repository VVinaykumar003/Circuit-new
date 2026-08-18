import { X, MapPin, Smartphone, Clock, Timer, Coffee } from "lucide-react";
import type { Attendance } from "../types/attendance";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

export default function AttendanceDetailsDrawer({
  record,
  onClose,
}: {
  record: Attendance | null;
  onClose: () => void;
}) {
  const open = record !== null;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-base-100 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {record && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-5 border-b border-base-300">
              <h3 className="font-bold text-lg">Attendance Details</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="flex items-center gap-3">
                <img src={record.profileImage} alt={record.employeeName} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{record.employeeName}</p>
                  <p className="text-xs text-base-content/60">
                    {record.designation} · {record.department}
                  </p>
                </div>
                <AttendanceStatusBadge status={record.status} />
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">
                  {new Date(record.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-base-200 p-3">
                    <p className="text-[11px] text-base-content/50">Check In</p>
                    <p className="font-semibold">{record.checkIn}</p>
                  </div>
                  <div className="rounded-xl bg-base-200 p-3">
                    <p className="text-[11px] text-base-content/50">Check Out</p>
                    <p className="font-semibold">{record.checkOut}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-base-300 p-3">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-semibold">{record.totalHours}h</p>
                  <p className="text-[10px] text-base-content/50">Working</p>
                </div>
                <div className="rounded-xl border border-base-300 p-3">
                  <Coffee className="w-4 h-4 mx-auto mb-1 text-warning" />
                  <p className="text-sm font-semibold">{record.breakHours}h</p>
                  <p className="text-[10px] text-base-content/50">Break</p>
                </div>
                <div className="rounded-xl border border-base-300 p-3">
                  <Timer className="w-4 h-4 mx-auto mb-1 text-success" />
                  <p className="text-sm font-semibold">{record.overtimeHours}h</p>
                  <p className="text-[10px] text-base-content/50">Overtime</p>
                </div>
              </div>

              {(record.location || record.device) && (
                <div className="space-y-2">
                  {record.location && (
                    <p className="flex items-center gap-2 text-sm text-base-content/70">
                      <MapPin className="w-4 h-4" /> {record.location}
                    </p>
                  )}
                  {record.device && (
                    <p className="flex items-center gap-2 text-sm text-base-content/70">
                      <Smartphone className="w-4 h-4" /> {record.device}
                    </p>
                  )}
                </div>
              )}

              {record.remarks && (
                <div className="rounded-xl bg-base-200 p-3">
                  <p className="text-[11px] text-base-content/50 mb-1">Remarks</p>
                  <p className="text-sm">{record.remarks}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-base-300">
              <button className="btn btn-primary btn-block btn-sm">Download Slip</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
