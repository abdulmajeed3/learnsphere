import api from '@/lib/axios';
import type { Course, PaginatedResponse, Difficulty } from '@/types';

export interface CourseFilters {
  search?: string;
  categoryId?: string;
  difficulty?: Difficulty;
  page?: number;
  limit?: number;
}

export const coursesApi = {
  list: (filters?: CourseFilters) =>
    api.get<PaginatedResponse<Course>>('/courses', { params: filters }).then((r) => r.data),
  get: (id: string) => api.get<Course>(`/courses/${id}`).then((r) => r.data),
  getMyCourses: () => api.get<Course[]>('/courses/my').then((r) => r.data),
  create: (data: Partial<Course>) => api.post<Course>('/courses', data).then((r) => r.data),
  update: (id: string, data: Partial<Course>) =>
    api.patch<Course>(`/courses/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/courses/${id}`).then((r) => r.data),
  publish: (id: string) => api.post<Course>(`/courses/${id}/publish`).then((r) => r.data),
  unpublish: (id: string) => api.post<Course>(`/courses/${id}/unpublish`).then((r) => r.data),
};
