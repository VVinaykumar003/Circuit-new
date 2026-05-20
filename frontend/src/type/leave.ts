export type LeaveType =
  | "casual"
  | "sick"
  | "paid"
  | "half-day";

export type LeaveStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

  export type LeaveRequest = {
  id: string;
  employee: string;
  type: "casual" | "sick" | "paid" | "half-day";
  fromDate: string;
  toDate?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

import {
  MdBeachAccess,
  MdSick,
  MdWork,
  MdTimelapse,
} from "react-icons/md";

export const leaveTypeIcon = {
  casual: MdBeachAccess,
  sick: MdSick,
  paid: MdWork,
  "half-day": MdTimelapse,
};
