import API from "../api/axios";

// ✅ Send Notification (with attachments)
export const sendNotification = (organizationSlug: string, formData: FormData) =>
  API.post(`/${organizationSlug}/notification`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  export const getNotifications = (organizationSlug: string) =>
  API.get(`/${organizationSlug}/notification`);
   export const updateNotification = (organizationSlug: string, notificationId: string, formData: FormData) =>
  API.put(`/${organizationSlug}/notification/${notificationId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
   export const deleteNotification = (organizationSlug: string, notificationId: string) =>  
  API.delete(`/${organizationSlug}/notification/${notificationId}`);

export const markAsRead = (organizationSlug: string, notificationId: string) =>
  API.put(`/${organizationSlug}/${notificationId}/read`);

export const markAllAsRead = (organizationSlug: string) =>
  API.put(`/${organizationSlug}/read-all`);

  