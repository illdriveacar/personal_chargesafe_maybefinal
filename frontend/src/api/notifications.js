import api from "./client";

export const listNotifications = () => api.get("/api/notifications");
export const readNotification = (id) => api.patch(`/api/notifications/${id}/read`);
export const readAllNotifications = () => api.post("/api/notifications/read-all");