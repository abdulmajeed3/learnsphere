import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, Clock, Users, CheckCircle, PlayCircle, Lock, Bookmark, Star, Trash2 } from 'lucide-react';
import { coursesApi } from '@/api/courses';
import { enrollmentsApi } from '@/api/enrollments';
import { bookmarksApi } from '@/api/bookmarks';
import { reviewsApi } from '@/api/reviews';
import { PageSpinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { StarRating } from '@/components/ui/StarRating';
import { useAuthStore } from '@/stores/authStore';

const diffColors = {
  BEGINNER: 'badge-green',
  INTERMEDIATE: 'badge-yellow',
  ADVANCED: 'badge-red',
} as const;

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState('');

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId!),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment-check', courseId],
    queryFn: () => enrollmentsApi.check(courseId!),
    enabled: isAuthenticated && user?.role === 'STUDENT',
  });

  const { data: bookmark } = useQuery({
    queryKey: ['bookmark-check', courseId],
    queryFn: () => bookmarksApi.check(courseId!),
    enabled: isAuthenticated && user?.role === 'STUDENT',
  });

  const toggleBookmark = useMutation({
    mutationFn: () => (bookmark ? bookmarksApi.remove(courseId!) : bookmarksApi.add(courseId!)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmark-check', courseId] });
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const enroll = useMutation({
    mutationFn: () => enrollmentsApi.enroll(courseId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => reviewsApi.getByCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-review', courseId],
    queryFn: () => reviewsApi.getMine(courseId!),
    enabled: isAuthenticated && user?.role === 'STUDENT' && !!courseId,
  });

  const submitReview = useMutation({
    mutationFn: () => reviewsApi.upsert(courseId!, { rating: reviewRating, body: reviewBody || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      qc.invalidateQueries({ queryKey: ['my-review', courseId] });
      setReviewBody('');
    },
  });

  const deleteReview = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      qc.invalidateQueries({ queryKey: ['my-review', courseId] });
      setReviewRating(0);
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error || !course)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Alert message="Course not found." />
      </div>
    );

  const isInstructor = user?.role === 'INSTRUCTOR' && user.id === course.instructorId;
  const totalMinutes = course.lessons?.reduce((s, l) => s + (l.duration ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex gap-2">
            <span className={diffColors[course.difficulty]}>
              {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
            </span>
            {course.category && <span className="badge-blue">{course.category.name}</span>}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>

          {course.objectives.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {course.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.instructor && (
            <div className="mb-6 rounded-xl border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Instructor</h2>
              <p className="font-medium text-gray-900">{course.instructor.name}</p>
              {course.instructor.bio && (
                <p className="text-sm text-gray-500 mt-1">{course.instructor.bio}</p>
              )}
            </div>
          )}

          {/* Lessons */}
          {course.lessons && course.lessons.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Course Content</h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {course.lessons.map((lesson, i) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 px-4 py-3 text-sm ${i > 0 ? 'border-t border-gray-100' : ''}`}
                  >
                    {lesson.type === 'VIDEO' ? (
                      <PlayCircle className="h-4 w-4 text-primary-500 shrink-0" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span className="flex-1 text-gray-700">{lesson.title}</span>
                    {lesson.duration && <span className="text-gray-400">{lesson.duration}m</span>}
                    {!enrollment && !isInstructor && <Lock className="h-3.5 w-3.5 text-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Student Reviews</h2>
              {reviewsData && reviewsData.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating value={reviewsData.averageRating} size="sm" />
                  <span className="text-sm text-gray-500">
                    {reviewsData.averageRating} ({reviewsData.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Write / edit review form for enrolled students */}
            {isAuthenticated && user?.role === 'STUDENT' && enrollment && (
              <div className="card p-5 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  {myReview ? 'Update Your Review' : 'Write a Review'}
                </h3>
                <div className="mb-3">
                  <StarRating
                    value={reviewRating || myReview?.rating || 0}
                    interactive
                    size="lg"
                    onChange={setReviewRating}
                  />
                </div>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share your experience with this course (optional)"
                  rows={3}
                  className="input resize-none mb-3"
                  defaultValue={myReview?.body ?? ''}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitReview.mutate()}
                    disabled={submitReview.isPending || (reviewRating || myReview?.rating || 0) === 0}
                    className="btn-primary text-sm"
                  >
                    {submitReview.isPending ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  {myReview && (
                    <button
                      onClick={() => deleteReview.mutate(myReview.id)}
                      disabled={deleteReview.isPending}
                      className="btn-ghost text-sm text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reviews list */}
            {reviewsData && reviewsData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.reviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                          {r.student?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.student?.name}</p>
                          <StarRating value={r.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.body && <p className="mt-3 text-sm text-gray-700">{r.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                No reviews yet. Be the first to review this course!
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 card p-6">
            <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/70" />
            </div>

            <div className="mb-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> {course.lessons?.length ?? 0} lessons
              </div>
              {totalMinutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {Math.round(totalMinutes / 60)}h {totalMinutes % 60}
                  m total
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> {course._count?.enrollments ?? 0} students
              </div>
              {course.averageRating != null && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  {course.averageRating} ({course.reviewCount} reviews)
                </div>
              )}
            </div>

            {isInstructor ? (
              <Link
                to={`/instructor/courses/${course.id}/edit`}
                className="btn-secondary w-full justify-center"
              >
                Edit Course
              </Link>
            ) : enrollment ? (
              <Link
                to={`/learn/${course.id}/lessons/${course.lessons?.[0]?.id ?? ''}`}
                className="btn-primary w-full justify-center"
              >
                Continue Learning
              </Link>
            ) : isAuthenticated && user?.role === 'STUDENT' ? (
              <>
                {enroll.isError && (
                  <Alert
                    message={(enroll.error as any)?.response?.data?.message ?? 'Enrollment failed'}
                    className="mb-3"
                  />
                )}
                <button
                  onClick={() => enroll.mutate()}
                  disabled={enroll.isPending}
                  className="btn-primary w-full justify-center"
                >
                  {enroll.isPending ? 'Enrolling...' : 'Enroll Now — Free'}
                </button>
              </>
            ) : (
              <Link to="/register" className="btn-primary w-full justify-center">
                Sign Up to Enroll
              </Link>
            )}

            {isAuthenticated && user?.role === 'STUDENT' && (
              <button
                onClick={() => toggleBookmark.mutate()}
                disabled={toggleBookmark.isPending}
                className={`btn w-full justify-center mt-3 ${
                  bookmark ? 'btn-secondary text-primary-600' : 'btn-ghost'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${bookmark ? 'fill-current' : ''}`} />
                {bookmark ? 'Saved' : 'Save Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
