import api from '@/lib/axios';
import type { CourseBookmark } from '@/types';

export const bookmarksApi = {
  add: (courseId: string) => api.post<CourseBookmark>(`/bookmarks/${courseId}`).then((r) => r.data),
  remove: (courseId: string) => api.delete(`/bookmarks/${courseId}`).then((r) => r.data),
  list: () => api.get<CourseBookmark[]>('/bookmarks').then((r) => r.data),
  check: (courseId: string) =>
    api
      .get<CourseBookmark | null>(`/bookmarks/check/${courseId}`)
      .then((r) => r.data)
      .catch(() => null),
};
