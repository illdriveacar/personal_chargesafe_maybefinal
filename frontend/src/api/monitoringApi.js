import api from "./client";

export const getMonitoringData = ({ deviceId, range }) =>
  api.get(`/api/devices/${deviceId}/monitoring`, { params: { range } });