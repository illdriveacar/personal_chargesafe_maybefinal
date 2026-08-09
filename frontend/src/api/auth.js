import api from "./client";

export const register = ({ userId, password, name, phone, signupType }) =>
  api.post("/api/auth/register", { userId, password, name, phone, signupType });

export const login = ({ userId, password }) =>
  api.post("/api/auth/login", { userId, password });

export const findId = ({ name, phone }) =>
  api.post("/api/auth/find-id", { name, phone });

export const requestPasswordReset = ({ userId, name, phone }) =>
  api.post("/api/auth/reset-password/request", { userId, name, phone });

export const resetPassword = ({ resetToken, password }) =>
  api.post("/api/auth/reset-password", { resetToken, password });