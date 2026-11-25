import api from '@/lib/axios';
import type { CourseReview } from '@/types';

interface ReviewsResponse {
  reviews: CourseReview[];
  averageRating: number | null;
  reviewCount: number;
}

export const reviewsApi = {
  upsert: (courseId: string, data: { rating: number; body?: string }) =>
    api.post<CourseReview>(`/reviews/${courseId}`, data).then((r) => r.data),

  getByCourse: (courseId: string) =>
    api.get<ReviewsResponse>(`/reviews/course/${courseId}`).then((r) => r.data),

  getMine: (courseId: string) =>
    api
      .get<CourseReview | null>(`/reviews/my/${courseId}`)
      .then((r) => r.data)
      .catch(() => null),

  delete: (reviewId: string) => api.delete(`/reviews/${reviewId}`).then((r) => r.data),
};
