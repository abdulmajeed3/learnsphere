import api from '@/lib/axios';
import type { Lesson } from '@/types';

export const lessonsApi = {
  list: (courseId: string) => api.get<Lesson[]>(`/courses/${courseId}/lessons`).then((r) => r.data),
  get: (courseId: string, lessonId: string) =>
    api.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data),
  create: (courseId: string, data: Partial<Lesson>) =>
    api.post<Lesson>(`/courses/${courseId}/lessons`, data).then((r) => r.data),
  update: (courseId: string, lessonId: string, data: Partial<Lesson>) =>
    api.patch<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, data).then((r) => r.data),
  delete: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data),
  reorder: (courseId: string, lessonIds: string[]) =>
    api.patch<Lesson[]>(`/courses/${courseId}/lessons/reorder`, { lessonIds }).then((r) => r.data),
};
