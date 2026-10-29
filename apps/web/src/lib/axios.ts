import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = data;
        localStorage.setItem('access_token', accessToken);
        queue.forEach((p) => p.resolve(accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        queue.forEach((p) => p.reject(refreshError));
        queue = [];
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
