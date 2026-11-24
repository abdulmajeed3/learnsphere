import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Trophy, ArrowRight, Bookmark, Award } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard';
import { bookmarksApi } from '@/api/bookmarks';
import { certificatesApi } from '@/api/certificates';
import { PageSpinner } from '@/components/ui/Spinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';

export function StudentDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: dashboardApi.student,
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.list,
  });

  const removeBookmark = useMutation({
    mutationFn: (courseId: string) => bookmarksApi.remove(courseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  const { data: certificates } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: certificatesApi.listMine,
  });
  const certifiedCourseIds = new Set(certificates?.map((c) => c.courseId) ?? []);

  const claimCertificate = useMutation({
    mutationFn: (courseId: string) => certificatesApi.claim(courseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-certificates'] }),
  });

  if (isLoading) return <PageSpinner />;

  const stats = [
    {
      label: 'Enrolled Courses',
      value: data?.totalEnrollments ?? 0,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Completed Courses',
      value: data?.completedCourses ?? 0,
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      label: 'Lessons Completed',
      value: data?.totalCompletedLessons ?? 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your learning progress</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link
              to="/courses"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Browse more <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!data?.courses?.length ? (
            <EmptyState
              title="No courses yet"
              description="Browse our catalog and enroll in your first course."
              action={
                <Link to="/courses" className="btn-primary">
                  Browse Courses
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.courses.map((c: any) => {
                const isComplete = c.progressPercentage === 100 && c.totalLessons > 0;
                const hasCert = certifiedCourseIds.has(c.courseId);
                return (
                  <div key={c.enrollmentId} className="card p-4 flex items-center gap-4">
                    <Link
                      to={`/courses/${c.courseId}`}
                      className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
                    >
                      <BookOpen className="h-6 w-6 text-white" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/courses/${c.courseId}`}
                        className="font-medium text-gray-900 hover:text-primary-700 truncate block"
                      >
                        {c.courseTitle}
                      </Link>
                      <p className="text-xs text-gray-500">{c.instructor?.name}</p>
                      <div className="mt-2">
                        <ProgressBar value={c.progressPercentage} size="sm" />
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.completedLessons}/{c.totalLessons} lessons · {c.progressPercentage}%
                        </p>
                      </div>
                    </div>
                    {isComplete &&
                      (hasCert ? (
                        <Link
                          to={`/certificates/${certificates?.find((cert) => cert.courseId === c.courseId)?.code}`}
                          className="btn-secondary text-xs shrink-0 gap-1"
                        >
                          <Award className="h-3.5 w-3.5 text-yellow-500" /> Certificate
                        </Link>
                      ) : (
                        <button
                          onClick={() => claimCertificate.mutate(c.courseId)}
                          disabled={claimCertificate.isPending}
                          className="btn-primary text-xs shrink-0 gap-1"
                        >
                          <Award className="h-3.5 w-3.5" /> Claim
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Quiz Attempts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Attempts</h2>
          {!data?.recentQuizAttempts?.length ? (
            <div className="card p-6 text-center text-sm text-gray-500">No quiz attempts yet</div>
          ) : (
            <div className="space-y-3">
              {data.recentQuizAttempts.map((a: any) => (
                <div key={a.id} className="card p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.quizTitle}</p>
                  <p className="text-xs text-gray-500 mb-2">{a.courseTitle}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${a.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {a.percentage}%
                    </span>
                    <span className="text-xs text-gray-400">
                      {a.score}/{a.totalPoints}
                    </span>
                  </div>
                  <ProgressBar value={a.percentage} size="sm" className="mt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Certificates */}
      {certificates && certificates.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">My Certificates</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                to={`/certificates/${cert.code}`}
                className="card p-5 hover:shadow-md transition-shadow flex items-start gap-4 group"
              >
                <div className="bg-yellow-100 text-yellow-600 rounded-xl p-3 shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-primary-700 truncate text-sm">
                    {cert.course.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{cert.course.instructor?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Issued {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Saved Courses */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Saved Courses</h2>
        </div>
        {!bookmarks?.length ? (
          <div className="card p-6 text-center text-sm text-gray-500">
            No saved courses yet. Bookmark courses from the catalog to find them here.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarks.map((b) => (
              <div key={b.id} className="card overflow-hidden">
                <Link
                  to={`/courses/${b.courseId}`}
                  className="block h-28 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <BookOpen className="h-10 w-10 text-white/70" />
                </Link>
                <div className="p-3">
                  <Link
                    to={`/courses/${b.courseId}`}
                    className="block font-medium text-gray-900 hover:text-primary-700 text-sm line-clamp-2 mb-1"
                  >
                    {b.course.title}
                  </Link>
                  {b.course.instructor && (
                    <p className="text-xs text-gray-500">by {b.course.instructor.name}</p>
                  )}
                  <button
                    onClick={() => removeBookmark.mutate(b.courseId)}
                    disabled={removeBookmark.isPending}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Bookmark className="h-3 w-3 fill-current" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
