import api from '@/lib/axios';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
}
export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: LoginPayload) => api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
  refresh: () => api.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data),
};
