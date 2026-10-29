import api from '@/lib/axios';
import type { Quiz, QuizAttempt } from '@/types';

export interface SubmitAttemptPayload {
  answers: { questionId: string; selectedOptionId?: string }[];
}

export const quizzesApi = {
  listByCourse: (courseId: string) =>
    api.get<Quiz[]>(`/quizzes/course/${courseId}`).then((r) => r.data),
  get: (quizId: string) => api.get<Quiz>(`/quizzes/${quizId}`).then((r) => r.data),
  create: (courseId: string, data: { title: string; description?: string }) =>
    api.post<Quiz>(`/quizzes/course/${courseId}`, data).then((r) => r.data),
  update: (quizId: string, data: Partial<{ title: string; description: string }>) =>
    api.patch<Quiz>(`/quizzes/${quizId}`, data).then((r) => r.data),
  delete: (quizId: string) => api.delete(`/quizzes/${quizId}`).then((r) => r.data),
  addQuestion: (
    quizId: string,
    data: { text: string; options: { text: string; isCorrect: boolean }[] },
  ) => api.post(`/quizzes/${quizId}/questions`, data).then((r) => r.data),
  updateQuestion: (quizId: string, questionId: string, data: any) =>
    api.patch(`/quizzes/${quizId}/questions/${questionId}`, data).then((r) => r.data),
  deleteQuestion: (quizId: string, questionId: string) =>
    api.delete(`/quizzes/${quizId}/questions/${questionId}`).then((r) => r.data),
  submit: (quizId: string, payload: SubmitAttemptPayload) =>
    api.post<QuizAttempt>(`/quizzes/${quizId}/attempt`, payload).then((r) => r.data),
  getAttempts: (quizId: string) =>
    api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts`).then((r) => r.data),
  getStats: (quizId: string) => api.get(`/quizzes/${quizId}/stats`).then((r) => r.data),
};
