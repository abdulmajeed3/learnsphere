import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { quizzesApi } from '@/api/quizzes';
import { PageSpinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

export function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzesApi.get(quizId!),
  });

  const submit = useMutation({
    mutationFn: () =>
      quizzesApi.submit(quizId!, {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }),
    onSuccess: (attempt) => {
      navigate(`/quizzes/${quizId}/results`, { state: { attempt } });
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!quiz) return <div className="max-w-3xl mx-auto px-4 py-8"><Alert message="Quiz not found." /></div>;

  const questions = quiz.questions ?? [];
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-500 mt-1">{quiz.description}</p>}
        <p className="text-sm text-gray-400 mt-1">{questions.length} questions</p>
      </div>

      {questions.length === 0 ? (
        <Alert variant="info" message="This quiz has no questions yet." />
      ) : (
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={q.id} className="card p-5">
              <p className="font-medium text-gray-900 mb-3">
                {qi + 1}. {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.id}
                      checked={answers[q.id] === opt.id}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className={`text-sm ${answers[q.id] === opt.id ? 'text-primary-700 font-medium' : 'text-gray-700'}`}>
                      {opt.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {submit.isError && (
            <Alert message={(submit.error as any)?.response?.data?.message ?? 'Submission failed'} />
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {Object.keys(answers).length}/{questions.length} answered
            </p>
            <button
              onClick={() => submit.mutate()}
              disabled={!allAnswered || submit.isPending}
              className="btn-primary px-6"
            >
              {submit.isPending ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
