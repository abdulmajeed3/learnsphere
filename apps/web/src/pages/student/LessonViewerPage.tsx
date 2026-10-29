import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import { lessonsApi } from '@/api/lessons';
import { progressApi } from '@/api/progress';
import { coursesApi } from '@/api/courses';
import { PageSpinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

export function LessonViewerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId!),
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonsApi.list(courseId!),
  });

  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: () => lessonsApi.get(courseId!, lessonId!),
  });

  const { data: progress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressApi.getCourseProgress(courseId!),
  });

  const markComplete = useMutation({
    mutationFn: () => progressApi.markComplete(lessonId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-progress', courseId] }),
  });

  const markIncomplete = useMutation({
    mutationFn: () => progressApi.markIncomplete(lessonId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-progress', courseId] }),
  });

  if (isLoading) return <PageSpinner />;
  if (error || !lesson)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert message="Lesson not found." />
      </div>
    );

  const isCompleted = progress?.completedLessonIds.includes(lessonId!);
  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = lessons?.[currentIndex - 1];
  const nextLesson = lessons?.[currentIndex + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar: lesson list */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <Link
                to={`/courses/${courseId}`}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> {course?.title}
              </Link>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {lessons?.map((l, i) => {
                const done = progress?.completedLessonIds.includes(l.id);
                const active = l.id === lessonId;
                return (
                  <Link
                    key={l.id}
                    to={`/learn/${courseId}/lessons/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-50 hover:bg-gray-50 transition-colors ${active ? 'bg-primary-50 border-l-2 border-l-primary-600' : ''}`}
                  >
                    {done ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle
                        className={`h-4 w-4 shrink-0 ${active ? 'text-primary-500' : 'text-gray-300'}`}
                      />
                    )}
                    <span
                      className={`flex-1 truncate ${active ? 'font-medium text-primary-700' : 'text-gray-600'}`}
                    >
                      {i + 1}. {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Lesson {currentIndex + 1} of {lessons?.length}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
            <button
              onClick={() => (isCompleted ? markIncomplete.mutate() : markComplete.mutate())}
              disabled={markComplete.isPending || markIncomplete.isPending}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Completed
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" /> Mark Complete
                </>
              )}
            </button>
          </div>

          <div className="card p-6 mb-4">
            {lesson.type === 'VIDEO' && lesson.videoUrl ? (
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <PlayCircle className="h-4 w-4 text-primary-500" /> Video Lesson
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <PlayCircle className="h-16 w-16 mx-auto mb-3 opacity-60" />
                    <p className="text-sm opacity-70">External video lesson</p>
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Open Video
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" /> Text Lesson
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {lesson.content ?? 'No content available.'}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevLesson ? (
              <Link
                to={`/learn/${courseId}/lessons/${prevLesson.id}`}
                className="btn-secondary text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                to={`/learn/${courseId}/lessons/${nextLesson.id}`}
                className="btn-primary text-sm"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to={`/courses/${courseId}`} className="btn-secondary text-sm">
                Back to Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
