import { useState } from "react";
import {
  MdClose,
  MdDescription,
  MdBeachAccess,
  MdSick,
  MdWork,
  MdTimelapse,
} from "react-icons/md";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import DateField from "@/components/ui/DateField";
import AttachmentInput from "@/components/ui/AttachmentInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (leave: any) => Promise<void> | void;
}

export default function ApplyLeaveModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  const [leave, setLeave] = useState({
    type: "casual",
    quickDay: "custom",
    fromDate: "",
    toDate: "",
    reason: "",
    attachments: [] as File[],
    status: "pending",
    session: "first-half",
    emergency: false,
  });

  const isHalfDay = leave.type === "half-day";

  /* ================= CALCULATE DAYS ================= */
  const calculateDays = () => {
    if (!leave.fromDate || !leave.toDate) return 0;

    const start = new Date(leave.fromDate);
    const end = new Date(leave.toDate);

    const diff =
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24);

    return diff >= 0 ? diff + 1 : 0;
  };

  /* ================= QUICK DATE ================= */
  const handleQuickSelect = (option: string) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    let selected = "";

    if (option === "today")
      selected = today.toISOString().split("T")[0];

    if (option === "tomorrow")
      selected = tomorrow.toISOString().split("T")[0];

    setLeave({
      ...leave,
      quickDay: option,
      fromDate: selected,
      toDate: selected,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 ">
      <div id="LeaveForm" className=" w-full max-w-2xl max-h-[90vh] bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-scroll ">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="font-semibold text-lg text-base-content">
            Apply Leave
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost text-base-content">
            <MdClose size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* LEAVE TYPE */}
          <div>
            <p className="text-xs mb-1 text-base-content/60">
              Leave Type
            </p>
            <Select
              value={leave.type}
              onChange={(e) =>
                setLeave({ ...leave, type: e.target.value })
              }
              className="text-base-content"
            >
              {/* "sick", "casual", "earned", "unpaid", "maternity", "paternity", "other" */}
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="paid">Paid Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="half-day">Half Day</option>
              <option value="other">Other Leave</option>
            </Select>
          </div>

          {/* QUICK SELECT */}
          <div>
            <p className="text-xs mb-2 text-base-content/60">
              Quick Select
            </p>
            <div className="flex gap-2 flex-wrap text-base-content">
              {["today", "tomorrow", "custom"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleQuickSelect(opt)}
                  className={`btn btn-sm ${
                    leave.quickDay === opt
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* SESSION FOR HALF DAY */}
          {isHalfDay && (
            <div>
              <p className="text-xs mb-1 text-base-content/60">
                Session
              </p>
              <Select
                value={leave.session}
                onChange={(e) =>
                  setLeave({
                    ...leave,
                    session: e.target.value,
                  })
                }
                className="text-base-content"
              >
                <option value="first-half">
                  First Half
                </option>
                <option value="second-half">
                  Second Half
                </option>
              </Select>
            </div>
          )}

          {/* DATES */}
          <div className="grid md:grid-cols-2 gap-4">
            <DateField
              label="From"
              value={leave.fromDate}
              onChange={(date) =>
                setLeave({ ...leave, fromDate: date })
              }
            />

            {!isHalfDay && (
              <DateField
                label="To"
                value={leave.toDate}
                onChange={(date) =>
                  setLeave({ ...leave, toDate: date })
                }
              />
            )}
          </div>

          {/* EMERGENCY */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-error border-2 border-base-content"
              checked={leave.emergency}
              onChange={(e) =>
                setLeave({
                  ...leave,
                  emergency: e.target.checked,
                })
              }
            />
            <span className="text-sm text-base-content ">
              Mark as Emergency Leave
            </span>
          </div>

          {/* REASON */}
          <div>
            <p className="text-xs mb-1 text-base-content/60">
              Reason
            </p>
            <textarea
              value={leave.reason}
              onChange={(e) =>
                setLeave({
                  ...leave,
                  reason: e.target.value,
                })
              }
              className="textarea textarea-bordered w-full border-black border text-base-content"
              rows={4}
            />
          </div>

          {/* ATTACHMENTS */}
          <AttachmentInput
            files={leave.attachments}
            onChange={(files) =>
              setLeave({ ...leave, attachments: files })
            }
            
          />

          {/* SUMMARY */}
          <div className="bg-base-200 rounded-lg p-4 text-sm text-base-content">
            <p className="font-medium mb-2 ">
              Leave Summary
            </p>

            <p>
              {leave.type} leave from{" "}
              <strong>{leave.fromDate || "—"}</strong>{" "}
              {!isHalfDay && (
                <>
                  to{" "}
                  <strong>
                    {leave.toDate || "—"}
                  </strong>
                </>
              )}
            </p>

            <p className="mt-2">
              Duration:{" "}
              <strong>
                {isHalfDay
                  ? "0.5 Day"
                  : calculateDays()}{" "}
                Day(s)
              </strong>
            </p>

            {leave.emergency && (
              <p className="text-error mt-1">
                🚨 Emergency Leave
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            disabled={
              !leave.fromDate ||
              !leave.reason ||
              (!isHalfDay && !leave.toDate)
            }
            onClick={async () => {
              if (onSubmit) {
                await onSubmit(leave);
              }
            }}
          >
            Submit Leave
          </Button>
        </div>
      </div>
    </div>
  );
}