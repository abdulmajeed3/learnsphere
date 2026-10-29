import api from '@/lib/axios';
import type { Enrollment } from '@/types';

export const enrollmentsApi = {
  enroll: (courseId: string) => api.post<Enrollment>('/enrollments', { courseId }).then(r => r.data),
  list: () => api.get<Enrollment[]>('/enrollments').then(r => r.data),
  get: (id: string) => api.get<Enrollment>(`/enrollments/${id}`).then(r => r.data),
  check: (courseId: string) =>
    api.get<Enrollment | null>(`/enrollments/check/${courseId}`).then(r => r.data).catch(() => null),
};
