import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { coursesApi } from '@/api/courses';
import { enrollmentsApi } from '@/api/enrollments';
import { PageSpinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/stores/authStore';

const diffColors = { BEGINNER: 'badge-green', INTERMEDIATE: 'badge-yellow', ADVANCED: 'badge-red' } as const;

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId!),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment-check', courseId],
    queryFn: () => enrollmentsApi.check(courseId!),
    enabled: isAuthenticated && user?.role === 'STUDENT',
  });

  const enroll = useMutation({
    mutationFn: () => enrollmentsApi.enroll(courseId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error || !course) return (
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
            <span className={diffColors[course.difficulty]}>{course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}</span>
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
              {course.instructor.bio && <p className="text-sm text-gray-500 mt-1">{course.instructor.bio}</p>}
            </div>
          )}

          {/* Lessons */}
          {course.lessons && course.lessons.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Course Content</h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {course.lessons.map((lesson, i) => (
                  <div key={lesson.id} className={`flex items-center gap-3 px-4 py-3 text-sm ${i > 0 ? 'border-t border-gray-100' : ''}`}>
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
                  <Clock className="h-4 w-4" /> {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m total
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> {course._count?.enrollments ?? 0} students
              </div>
            </div>

            {isInstructor ? (
              <Link to={`/instructor/courses/${course.id}/edit`} className="btn-secondary w-full justify-center">
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
                  <Alert message={(enroll.error as any)?.response?.data?.message ?? 'Enrollment failed'} className="mb-3" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
