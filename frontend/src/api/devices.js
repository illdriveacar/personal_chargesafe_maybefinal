import api from "./client";

export const listDevices = () => api.get("/api/devices");
export const listDiscoverable = () => api.get("/api/devices/discoverable");
export const connectDevice = (serialNumber) =>
  api.post("/api/devices", { serial_number: serialNumber });
export const updateDevice = (deviceId, body) =>
  api.patch(`/api/devices/${deviceId}`, body);
export const removeDevice = (deviceId) => api.delete(`/api/devices/${deviceId}`);

export const getDashboard = (deviceId) =>
  api.get(`/api/devices/${deviceId}/dashboard`);
export const getMonitoring = (deviceId, range) =>
  api.get(`/api/devices/${deviceId}/monitoring`, { params: { range } });
export const getHistory = (deviceId) =>
  api.get(`/api/devices/${deviceId}/history`);

export const requestFirmwareUpdate = (deviceId) =>
  api.post(`/api/devices/${deviceId}/firmware-update`);

// 보호자 공유
export const listMembers = (deviceId) => api.get(`/api/devices/${deviceId}/members`);
export const createInvite = (deviceId, relation) =>
  api.post(`/api/devices/${deviceId}/invites`, { relation });
export const acceptInvite = (code) => api.post(`/api/devices/invites/${code}`);
export const removeMember = (deviceId, userId) =>
  api.delete(`/api/devices/${deviceId}/members/${userId}`);