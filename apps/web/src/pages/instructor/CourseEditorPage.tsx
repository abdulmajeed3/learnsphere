import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { coursesApi } from '@/api/courses';
import { categoriesApi } from '@/api/categories';
import { Alert } from '@/components/ui/Alert';
import { Spinner, PageSpinner } from '@/components/ui/Spinner';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  categoryId: z.string().optional(),
  objectives: z.string().optional(),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export function CourseEditorPage() {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!courseId;

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId!),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: course
      ? {
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription ?? '',
          difficulty: course.difficulty,
          categoryId: course.categoryId ?? '',
          objectives: course.objectives.join('\n'),
          thumbnailUrl: course.thumbnailUrl ?? '',
        }
      : undefined,
    defaultValues: { difficulty: 'BEGINNER' },
  });

  const create = useMutation({
    mutationFn: (data: any) => coursesApi.create(data),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['my-courses'] });
      navigate(`/instructor/courses/${c.id}/edit`);
    },
  });

  const update = useMutation({
    mutationFn: (data: any) => coursesApi.update(courseId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-courses'] });
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      objectives: data.objectives
        ? data.objectives
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      categoryId: data.categoryId || undefined,
      thumbnailUrl: data.thumbnailUrl || undefined,
    };
    if (isEdit) update.mutate(payload);
    else create.mutate(payload);
  };

  const mutation = isEdit ? update : create;
  const errorMsg = mutation.error
    ? ((mutation.error as any)?.response?.data?.message ?? 'Save failed')
    : null;

  if (isEdit && courseLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Course' : 'Create Course'}
      </h1>

      {errorMsg && <Alert message={errorMsg} className="mb-4" />}
      {mutation.isSuccess && isEdit && (
        <Alert variant="success" message="Course saved!" className="mb-4" />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Course Title *</label>
          <input
            className="input"
            placeholder="e.g. Complete React Development Bootcamp"
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Short Description</label>
          <input
            className="input"
            placeholder="A brief summary (shown in cards)"
            {...register('shortDescription')}
          />
        </div>

        <div>
          <label className="label">Full Description *</label>
          <textarea
            className="input min-h-32 resize-y"
            placeholder="Describe what students will learn..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Difficulty Level *</label>
            <select className="input" {...register('difficulty')}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('categoryId')}>
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Learning Objectives (one per line)</label>
          <textarea
            className="input min-h-24 resize-y font-mono text-sm"
            placeholder="Build real-world applications&#10;Master React hooks&#10;Deploy to production"
            {...register('objectives')}
          />
        </div>

        <div>
          <label className="label">Thumbnail URL</label>
          <input className="input" placeholder="https://..." {...register('thumbnailUrl')} />
          {errors.thumbnailUrl && (
            <p className="text-xs text-red-600 mt-1">{errors.thumbnailUrl.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Spinner size="sm" /> : isEdit ? 'Save Changes' : 'Create Course'}
          </button>
          {isEdit && (
            <a href={`/instructor/courses/${courseId}/lessons`} className="btn-secondary">
              Manage Lessons →
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
