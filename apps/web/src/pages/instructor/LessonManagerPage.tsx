import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Plus, Trash2, Edit, ArrowLeft, GripVertical, PlayCircle, BookOpen } from 'lucide-react';
import { lessonsApi } from '@/api/lessons';
import { coursesApi } from '@/api/courses';
import { Alert } from '@/components/ui/Alert';
import { Spinner, PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import type { Lesson } from '@/types';

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  type: z.enum(['TEXT', 'VIDEO']),
  content: z.string().optional(),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  duration: z.coerce.number().int().min(1).optional(),
});
type FormData = z.infer<typeof schema>;

export function LessonManagerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const qc = useQueryClient();
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId!),
  });
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonsApi.list(courseId!),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['lessons', courseId] });

  const create = useMutation({
    mutationFn: (data: any) => lessonsApi.create(courseId!, data),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed'),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => lessonsApi.update(courseId!, id, data),
    onSuccess: () => {
      invalidate();
      setEditLesson(null);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => lessonsApi.delete(courseId!, id),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed'),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to={`/instructor/courses/${courseId}/edit`} className="btn-ghost gap-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lessons</h1>
          <p className="text-sm text-gray-500">{course?.title}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary gap-2 ml-auto">
          <Plus className="h-4 w-4" /> Add Lesson
        </button>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      {!lessons?.length ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">No lessons yet. Add your first lesson.</p>
          <button onClick={() => setCreateOpen(true)} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Add Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="card p-4 flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-gray-300 shrink-0" />
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${lesson.type === 'VIDEO' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}
              >
                {lesson.type === 'VIDEO' ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {i + 1}. {lesson.title}
                </p>
                <p className="text-xs text-gray-400">
                  {lesson.type}
                  {lesson.duration ? ` · ${lesson.duration}m` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditLesson(lesson)} className="btn-ghost text-xs gap-1">
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(lesson.id)}
                  className="btn-ghost text-xs text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LessonForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Lesson"
        onSubmit={(data) => create.mutate(data)}
        isPending={create.isPending}
      />

      {editLesson && (
        <LessonForm
          open={!!editLesson}
          onClose={() => setEditLesson(null)}
          title="Edit Lesson"
          defaultValues={editLesson}
          onSubmit={(data) => update.mutate({ id: editLesson.id, data })}
          isPending={update.isPending}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Lesson?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={() => remove.mutate(deleteId)}
                disabled={remove.isPending}
                className="btn-danger text-sm"
              >
                {remove.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonForm({
  open,
  onClose,
  title,
  defaultValues,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  defaultValues?: Partial<Lesson>;
  onSubmit: (d: any) => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'TEXT', ...defaultValues },
  });
  const lessonType = watch('type');

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="Lesson title" {...register('title')} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input" {...register('type')}>
              <option value="TEXT">Text</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div>
            <label className="label">Duration (min)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 15"
              {...register('duration')}
            />
          </div>
        </div>
        {lessonType === 'VIDEO' ? (
          <div>
            <label className="label">Video URL</label>
            <input
              className="input"
              placeholder="https://youtube.com/..."
              {...register('videoUrl')}
            />
            {errors.videoUrl && (
              <p className="text-xs text-red-600 mt-1">{errors.videoUrl.message}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="label">Content</label>
            <textarea
              className="input min-h-36 resize-y font-mono text-sm"
              placeholder="Lesson content..."
              {...register('content')}
            />
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? <Spinner size="sm" /> : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
