export const APP_CONFIG = {
  APP_NAME: "Circuit ERP",
  COMPANY_NAME: "Circuit Technologies",
  VERSION: "2.0.0",
  DEFAULT_LANGUAGE: "en",
  DATE_FORMAT: "dd MMM yyyy",
  TIME_FORMAT: "hh:mm a",
  DATETIME_FORMAT: "dd MMM yyyy, hh:mm a",
  CURRENCY_SYMBOL: "₹",
  CURRENCY_CODE: "INR",
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  STORAGE_KEYS: {
    AUTH_TOKEN: "token",
    USER: "user",
    SLUG: "slug",
    ACTIVE_DEPARTMENT: "selected_department",
    THEME: "theme",
    SIDEBAR_COLLAPSED: "sidebar_collapsed",
  },
};

export const TASK_STATUSES = ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"] as const;
export const ORDER_PAYMENT_STATUSES = ["Pending", "Paid", "Partially Paid", "Failed"] as const;

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"] as const;
export const LEAD_STAGES = ["Discovery", "Qualification", "Demo", "Proposal", "Closing"] as const;

export const ATTENDANCE_STATUSES = ["Present", "Absent", "Half Day", "Late", "On Leave", "Holiday"] as const;
export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected", "Cancelled"] as const;
