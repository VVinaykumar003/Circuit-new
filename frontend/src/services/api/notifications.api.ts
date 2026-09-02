import { API } from "./axios";
import type { Notification, NotificationStats } from "../notificationServices";

export const getNotifications = async (slug: string) => {
  const response = await API.get(`/notification/${slug}/notifications`);
  return response.data;
};

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
