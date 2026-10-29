import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Users, FileText, Plus, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';

export function InstructorDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: dashboardApi.instructor,
  });

  if (isLoading) return <PageSpinner />;

  const stats = [
    { label: 'Total Courses', value: data?.totalCourses ?? 0, icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
    { label: 'Published', value: data?.publishedCourses ?? 0, icon: Eye, color: 'text-green-600 bg-green-100' },
    { label: 'Draft', value: data?.draftCourses ?? 0, icon: EyeOff, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Total Students', value: data?.totalEnrollments ?? 0, icon: Users, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Courses */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
        <Link to="/instructor/courses" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!data?.courses?.length ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course and start teaching."
          action={<Link to="/instructor/courses/new" className="btn-primary">Create Course</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Course</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Students</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Lessons</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.courses.slice(0, 8).map((c: any) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <p className="text-gray-400 text-xs">{c.difficulty}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={c.status === 'PUBLISHED' ? 'badge-green' : 'badge-yellow'}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{c.enrollmentCount}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{c.lessonCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/instructor/courses/${c.id}/edit`} className="btn-ghost text-xs">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
