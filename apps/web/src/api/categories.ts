import api from '@/lib/axios';
import type { Category } from '@/types';

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then(r => r.data),
};
