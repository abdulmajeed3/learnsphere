import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Trophy, ArrowRight } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard';
import { PageSpinner } from '@/components/ui/Spinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';

export function StudentDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: dashboardApi.student,
  });

  if (isLoading) return <PageSpinner />;

  const stats = [
    { label: 'Enrolled Courses', value: data?.totalEnrollments ?? 0, icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
    { label: 'Completed Courses', value: data?.completedCourses ?? 0, icon: Trophy, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Lessons Completed', value: data?.totalCompletedLessons ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
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
            <Link to="/courses" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Browse more <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!data?.courses?.length ? (
            <EmptyState
              title="No courses yet"
              description="Browse our catalog and enroll in your first course."
              action={<Link to="/courses" className="btn-primary">Browse Courses</Link>}
            />
          ) : (
            <div className="space-y-3">
              {data.courses.map((c: any) => (
                <Link
                  key={c.enrollmentId}
                  to={`/courses/${c.courseId}`}
                  className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                >
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-primary-700 truncate">{c.courseTitle}</p>
                    <p className="text-xs text-gray-500">{c.instructor?.name}</p>
                    <div className="mt-2">
                      <ProgressBar value={c.progressPercentage} size="sm" />
                      <p className="text-xs text-gray-400 mt-0.5">{c.completedLessons}/{c.totalLessons} lessons · {c.progressPercentage}%</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Attempts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Attempts</h2>
          {!data?.recentQuizAttempts?.length ? (
            <div className="card p-6 text-center text-sm text-gray-500">
              No quiz attempts yet
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentQuizAttempts.map((a: any) => (
                <div key={a.id} className="card p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.quizTitle}</p>
                  <p className="text-xs text-gray-500 mb-2">{a.courseTitle}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${a.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {a.percentage}%
                    </span>
                    <span className="text-xs text-gray-400">{a.score}/{a.totalPoints}</span>
                  </div>
                  <ProgressBar value={a.percentage} size="sm" className="mt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
