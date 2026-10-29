import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react';
import { quizzesApi } from '@/api/quizzes';
import { coursesApi } from '@/api/courses';
import { Alert } from '@/components/ui/Alert';
import { Spinner, PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

const quizSchema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
});

const questionSchema = z.object({
  text: z.string().min(3, 'Question text required'),
  options: z.array(z.object({ text: z.string().min(1, 'Option text required'), isCorrect: z.boolean() }))
    .min(2, 'At least 2 options required')
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, 'Exactly one correct answer required'),
});

type QuizFormData = z.infer<typeof quizSchema>;
type QuestionFormData = z.infer<typeof questionSchema>;

export function QuizManagerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const qc = useQueryClient();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: course } = useQuery({ queryKey: ['course', courseId], queryFn: () => coursesApi.get(courseId!) });
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => quizzesApi.listByCourse(courseId!),
  });
  const { data: selectedQuiz } = useQuery({
    queryKey: ['quiz', selectedQuizId],
    queryFn: () => quizzesApi.get(selectedQuizId!),
    enabled: !!selectedQuizId,
  });

  const invalidateQuizzes = () => qc.invalidateQueries({ queryKey: ['quizzes', courseId] });
  const invalidateQuiz = () => qc.invalidateQueries({ queryKey: ['quiz', selectedQuizId] });

  const createQuiz = useMutation({
    mutationFn: (data: QuizFormData) => quizzesApi.create(courseId!, data),
    onSuccess: (q) => { invalidateQuizzes(); setCreateQuizOpen(false); setSelectedQuizId(q.id); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteQuiz = useMutation({
    mutationFn: (id: string) => quizzesApi.delete(id),
    onSuccess: () => { invalidateQuizzes(); setSelectedQuizId(null); },
  });

  const addQuestion = useMutation({
    mutationFn: (data: QuestionFormData) => quizzesApi.addQuestion(selectedQuizId!, data),
    onSuccess: () => { invalidateQuiz(); setAddQuestionOpen(false); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteQuestion = useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      quizzesApi.deleteQuestion(quizId, questionId),
    onSuccess: () => invalidateQuiz(),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to={`/instructor/courses/${courseId}/edit`} className="btn-ghost gap-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-sm text-gray-500">{course?.title}</p>
        </div>
        <button onClick={() => setCreateQuizOpen(true)} className="btn-primary gap-2 ml-auto">
          <Plus className="h-4 w-4" /> New Quiz
        </button>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quiz list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Quizzes ({quizzes?.length ?? 0})</h2>
          {!quizzes?.length ? (
            <div className="card p-4 text-center text-sm text-gray-500">No quizzes yet</div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuizId(q.id)}
                  className={`w-full text-left card p-3 transition-colors ${selectedQuizId === q.id ? 'border-primary-400 bg-primary-50' : 'hover:bg-gray-50'}`}
                >
                  <p className="font-medium text-sm text-gray-900">{q.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{q._count?.questions ?? 0} questions</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quiz detail */}
        <div className="md:col-span-2">
          {!selectedQuizId ? (
            <div className="card p-8 text-center">
              <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Select a quiz to manage its questions</p>
            </div>
          ) : !selectedQuiz ? (
            <PageSpinner />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedQuiz.title}</h2>
                  {selectedQuiz.description && <p className="text-sm text-gray-500">{selectedQuiz.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddQuestionOpen(true)} className="btn-secondary text-sm gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Question
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this quiz?')) deleteQuiz.mutate(selectedQuizId); }}
                    className="btn-ghost text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!selectedQuiz.questions?.length ? (
                <div className="card p-6 text-center">
                  <p className="text-gray-500 text-sm mb-3">No questions yet.</p>
                  <button onClick={() => setAddQuestionOpen(true)} className="btn-primary text-sm gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedQuiz.questions.map((q, qi) => (
                    <div key={q.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-medium text-gray-900">{qi + 1}. {q.text}</p>
                        <button
                          onClick={() => deleteQuestion.mutate({ quizId: selectedQuizId, questionId: q.id })}
                          className="btn-ghost text-xs text-red-500 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {q.options.map((opt) => (
                          <div key={opt.id} className={`flex items-center gap-2 text-sm rounded px-2 py-1 ${opt.isCorrect ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>
                            {opt.isCorrect ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            ) : (
                              <span className="h-3.5 w-3.5 rounded-full border border-gray-300 shrink-0" />
                            )}
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create quiz modal */}
      <Modal open={createQuizOpen} onClose={() => setCreateQuizOpen(false)} title="Create Quiz">
        <QuizCreateForm onSubmit={(d) => createQuiz.mutate(d)} isPending={createQuiz.isPending} />
      </Modal>

      {/* Add question modal */}
      {selectedQuizId && (
        <Modal open={addQuestionOpen} onClose={() => setAddQuestionOpen(false)} title="Add Question" size="lg">
          <QuestionForm onSubmit={(d) => addQuestion.mutate(d)} isPending={addQuestion.isPending} />
        </Modal>
      )}
    </div>
  );
}

function QuizCreateForm({ onSubmit, isPending }: { onSubmit: (d: QuizFormData) => void; isPending: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<QuizFormData>({ resolver: zodResolver(quizSchema) });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Quiz Title *</label>
        <input className="input" placeholder="e.g. React Fundamentals Quiz" {...register('title')} />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={2} placeholder="Optional description" {...register('description')} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <Spinner size="sm" /> : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}

function QuestionForm({ onSubmit, isPending }: { onSubmit: (d: QuestionFormData) => void; isPending: boolean }) {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  });
  const { fields } = useFieldArray({ control, name: 'options' });
  const options = watch('options');

  const selectCorrect = (correctIndex: number) => {
    fields.forEach((_, j) => {
      setValue(`options.${j}.isCorrect`, j === correctIndex, { shouldValidate: true });
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Question *</label>
        <textarea className="input" rows={2} placeholder="What is...?" {...register('text')} />
        {errors.text && <p className="text-xs text-red-600 mt-1">{errors.text.message}</p>}
      </div>
      <div>
        <label className="label">Answer Options (select the correct one)</label>
        {typeof errors.options === 'object' && !Array.isArray(errors.options) && (
          <p className="text-xs text-red-600 mb-2">{(errors.options as any)?.message}</p>
        )}
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctAnswer"
                checked={options[i]?.isCorrect ?? false}
                onChange={() => selectCorrect(i)}
                className="h-4 w-4 text-primary-600"
              />
              <input
                className="input flex-1"
                placeholder={`Option ${i + 1}`}
                {...register(`options.${i}.text`)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Click the radio button to mark the correct answer</p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <Spinner size="sm" /> : 'Add Question'}
        </button>
      </div>
    </form>
  );
}
