import axios from "axios";

const TOKEN_KEY = "accessToken";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  timeout: 30000, // Render 무료 플랜은 깨어나는 데 약 25초 걸립니다
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      const failure = new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      failure.status = 0;
      return Promise.reject(failure);
    }
    const { status, data } = error.response;
    if (status === 401) {
      clearToken();
      const failure = new Error("로그인이 필요합니다.");
      failure.status = 401;
      return Promise.reject(failure);
    }
    // 사용자에게 그대로 보여줄 한글 안내는 message 로 옵니다
    const failure = new Error(data?.message ?? data?.error ?? "요청에 실패했습니다.");
    failure.status = status;
    return Promise.reject(failure);
  }
);

export default api;