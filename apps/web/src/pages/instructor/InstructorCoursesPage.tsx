import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  BookOpen,
  Users,
  Eye,
  EyeOff,
  Trash2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { coursesApi } from '@/api/courses';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { useState } from 'react';

export function InstructorCoursesPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: coursesApi.getMyCourses,
  });

  const publish = useMutation({
    mutationFn: (id: string) => coursesApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-courses'] }),
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to publish'),
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => coursesApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-courses'] }),
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to unpublish'),
  });

  const deleteCourse = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['my-courses'] });
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to delete'),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <Link to="/instructor/courses/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Course
        </Link>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      {!courses?.length ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to start teaching."
          action={
            <Link to="/instructor/courses/new" className="btn-primary">
              Create Course
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="card p-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                <BookOpen className="h-7 w-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                  <span className={course.status === 'PUBLISHED' ? 'badge-green' : 'badge-yellow'}>
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> {course._count?.lessons ?? 0} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {course._count?.enrollments ?? 0} students
                  </span>
                  <span>{course.difficulty}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={`/instructor/courses/${course.id}/lessons`}
                  className="btn-ghost text-xs gap-1"
                >
                  <FileText className="h-3.5 w-3.5" /> Lessons
                </Link>
                <Link
                  to={`/instructor/courses/${course.id}/quizzes`}
                  className="btn-ghost text-xs gap-1"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Quizzes
                </Link>
                <Link
                  to={`/instructor/courses/${course.id}/edit`}
                  className="btn-ghost text-xs gap-1"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() =>
                    course.status === 'PUBLISHED'
                      ? unpublish.mutate(course.id)
                      : publish.mutate(course.id)
                  }
                  className="btn-ghost text-xs gap-1"
                  title={course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                >
                  {course.status === 'PUBLISHED' ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Publish
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleteId(course.id)}
                  className="btn-ghost text-xs gap-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Course?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. All lessons and quizzes will be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={() => deleteCourse.mutate(deleteId)}
                disabled={deleteCourse.isPending}
                className="btn-danger text-sm"
              >
                {deleteCourse.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
