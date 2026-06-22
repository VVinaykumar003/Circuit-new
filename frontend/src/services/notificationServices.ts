import API from "@/api/axios";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'Task' | 'Lead' | 'Order' | 'Payment' | 'Target' | 'Meeting' | 'Announcement' | 'System';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isRead: boolean;
  createdBy: string;
  createdAt: string;
  link?: string;
  recipient?: string;
  department?: string;
  attachment?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  readRate: number;
  deliveryRate: number;
}

export const getNotifications = async (slug: string) => {
    const response = await API.get(`/notification/${slug}/notifications`);
    return response.data;
}

export const getUnreadNotifications = async (slug: string) => {
  return API.get(`/notification/${slug}/notifications/unread`);
};

export const getNotificationById = async (slug: string, id: string) => {
  return API.get(`/notification/${slug}/notifications/${id}`);
};

export const markAsRead = async (slug: string, id: string) => {
  return API.put(`/notification/${slug}/notifications/read/${id}`);
};

export const markAllAsRead = async (slug: string) => {
  return API.put(`/notification/${slug}/notifications/read-all`);
};

export const deleteNotification = async (slug: string, id: string) => {
  return API.delete(`/notification/${slug}/notifications/${id}`);
};

export const sendNotification = async (slug: string, payload: Partial<Notification>) => {
  return API.post(`/notification/${slug}/notifications/send`, payload);
};

export const getNotificationStats = async (slug: string) => {
  return API.get<{ data: NotificationStats }>(`/notification/${slug}/notifications/stats`);
};

// Mock Data Generator for Dev/Testing (Remove in Production)
export const getMockNotifications = (): Notification[] => [
  { _id: '1', title: 'Task Assigned', message: 'You have been assigned a new task: Follow up with Acme Corp.', type: 'Task', priority: 'High', isRead: false, createdBy: 'System', createdAt: new Date().toISOString(), link: '/sales/tasks/1' },
  { _id: '2', title: 'Order Approved', message: 'Order SO-2026-0045 has been approved by the manager.', type: 'Order', priority: 'Medium', isRead: false, createdBy: 'Admin', createdAt: new Date(Date.now() - 3600000).toISOString(), link: '/sales/orders/2' },
  { _id: '3', title: 'Target Achieved! 🏆', message: 'Congratulations! You have hit your Q3 revenue target.', type: 'Target', priority: 'Urgent', isRead: true, createdBy: 'System', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: '4', title: 'New Lead Assigned', message: 'A new enterprise lead has been assigned to you.', type: 'Lead', priority: 'High', isRead: true, createdBy: 'Manager', createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/sales/leads/3' },
];

export const getMockNotificationStats = (): NotificationStats => ({
  total: 1250,
  unread: 45,
  readRate: 88.5,
  deliveryRate: 99.8,
});