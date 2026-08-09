import api from "./client";

export const getMe = () => api.get("/api/me");
export const updateProfile = (body) => api.patch("/api/me", body);
export const changePassword = (body) => api.patch("/api/me/password", body);
export const getSettings = () => api.get("/api/me/settings");
export const updateSettings = (body) => api.patch("/api/me/settings", body);