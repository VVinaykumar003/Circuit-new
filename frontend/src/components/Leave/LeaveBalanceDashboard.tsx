import {
  MdBeachAccess,
  MdSick,
  MdWork,
  MdEventAvailable,
  MdWarning,
} from "react-icons/md";
import type { LeaveRequest } from "@/type/leave";

interface Props {
  requests: LeaveRequest[];
  policy?: any;
}

export default function LeaveBalanceDashboard({
  requests,
  policy,
}: Props) {
  /* ================= POLICY ================= */
  const POLICY = {
    casual: policy?.casual ?? 12,
    sick: policy?.sick ?? 8,
    paid: policy?.paid ?? 15,
  };

  /* ================= USED CALCULATION ================= */
  const approvedLeaves = requests.filter(
    (r) => r.status === "approved"
  );

  const used = {
    casual: approvedLeaves.filter(
      (r) => r.type === "casual"
    ).length,
    sick: approvedLeaves.filter(
      (r) => r.type === "sick"
    ).length,
    paid: approvedLeaves.filter(
      (r) => r.type === "paid"
    ).length,
  };

  const remaining = {
    casual: POLICY.casual - used.casual,
    sick: POLICY.sick - used.sick,
    paid: POLICY.paid - used.paid,
  };

  const totalUsed =
    used.casual + used.sick + used.paid;

  /* ================= EXPIRING LOGIC ================= */
  const expiringSoon =
    remaining.casual > 0
      ? remaining.casual
      : 0;

  const cards = [
    {
      title: "Casual Leave",
      remaining: remaining.casual,
      total: POLICY.casual,
      icon: MdBeachAccess,
      color: "text-primary",
    },
    {
      title: "Sick Leave",
      remaining: remaining.sick,
      total: POLICY.sick,
      icon: MdSick,
      color: "text-warning",
    },
    {
      title: "Paid Leave",
      remaining: remaining.paid,
      total: POLICY.paid,
      icon: MdWork,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ================= BALANCE CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-white/50 border border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-base-content font-semibold">
                    {card.title}
                  </p>

                  <p className="text-2xl font-semibold text-base-content"> 
                    {card.remaining}
                    <span className="text-sm text-base-content/50">
                      {" "}
                      / {card.total}
                    </span>
                  </p>
                </div>

                <Icon
                  size={30}
                  className={`${card.color}`}
                />
              </div>

              {/* Progress Bar */}
              <progress
                className="progress progress-primary/40 w-full mt-4"
                value={card.remaining}
                max={card.total}
              />
            </div>
          );
        })}
      </div>

      {/* ================= SUMMARY SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total Used */}
        <div className="bg-white/50 border border-primary/40   rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <MdEventAvailable size={24} className="text-info" />
            <div>
              <p className="text-sm text-base-content/60 font-semibold">
                Total Used
              </p>
              <p className="text-xl font-semibold text-base-content">
                {totalUsed} Days
              </p>
            </div>
          </div>
        </div>

        {/* Expiring Leaves */}
        <div className="bg-white/50 border border-primary/40   rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <MdWarning size={24} className="text-error" />
            <div>
              <p className="text-sm text-base-content/60 font-semibold">
                Expiring Soon
              </p>
              <p className="text-xl font-semibold text-base-content">
                {expiringSoon} Days
              </p>
            </div>
          </div>
        </div>

        {/* Year Summary */}
        <div className="bg-white/50 border border-primary/40   rounded-xl p-4 shadow-sm">
          <p className="text-sm text-base-content/60 font-semibold">
            Leave Year Summary
          </p>
          <p className="text-xl font-semibold text-base-content ">
            {totalUsed} /{" "}
            {POLICY.casual +
              POLICY.sick +
              POLICY.paid}
          </p>
        </div>

      </div>
    </div>
  );
}