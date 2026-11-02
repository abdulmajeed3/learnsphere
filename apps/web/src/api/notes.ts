import api from '@/lib/axios';
import type { LessonNote } from '@/types';

export const notesApi = {
  list: (lessonId: string) =>
    api.get<LessonNote[]>(`/notes/lesson/${lessonId}`).then((r) => r.data),
  create: (lessonId: string, content: string) =>
    api.post<LessonNote>(`/notes/lesson/${lessonId}`, { content }).then((r) => r.data),
  update: (noteId: string, content: string) =>
    api.patch<LessonNote>(`/notes/${noteId}`, { content }).then((r) => r.data),
  delete: (noteId: string) => api.delete(`/notes/${noteId}`).then((r) => r.data),
};
