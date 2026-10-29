import api from '@/lib/axios';
import type { CourseProgress, LessonProgress } from '@/types';

export const progressApi = {
  markComplete: (lessonId: string) =>
    api.post<LessonProgress>(`/progress/${lessonId}/complete`).then(r => r.data),
  markIncomplete: (lessonId: string) =>
    api.delete(`/progress/${lessonId}/complete`).then(r => r.data),
  getCourseProgress: (courseId: string) =>
    api.get<CourseProgress>(`/progress/courses/${courseId}`).then(r => r.data),
};
