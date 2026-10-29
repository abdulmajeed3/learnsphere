import api from '@/lib/axios';
import type { User } from '@/types';

export const usersApi = {
  getProfile: () => api.get<User>('/users/profile').then((r) => r.data),
  updateProfile: (data: { name?: string; bio?: string; avatarUrl?: string }) =>
    api.patch<User>('/users/profile', data).then((r) => r.data),
};
