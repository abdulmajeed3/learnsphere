import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { quizzesApi } from '@/api/quizzes';
import { PageSpinner } from '@/components/ui/Spinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { QuizAttempt } from '@/types';

export function QuizResultPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const latestAttempt = location.state?.attempt as QuizAttempt | undefined;

  const { data: attempts, isLoading } = useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn: () => quizzesApi.getAttempts(quizId!),
  });

  if (isLoading) return <PageSpinner />;

  const attempt = latestAttempt ?? attempts?.[0];
  const pct = attempt ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;
  const passed = pct >= 70;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {attempt && (
        <div className="card p-6 mb-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <Trophy className={`h-8 w-8 ${passed ? 'text-green-600' : 'text-red-500'}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {passed ? 'Well done!' : 'Keep trying!'}
          </h1>
          <p className="text-gray-500 mb-4">
            You scored {attempt.score} out of {attempt.totalPoints}
          </p>
          <div
            className="text-4xl font-bold mb-4"
            style={{ color: passed ? '#16a34a' : '#dc2626' }}
          >
            {pct}%
          </div>
          <ProgressBar value={pct} className="mb-6" />

          {attempt.answers?.length > 0 && (
            <div className="text-left space-y-3 mb-6">
              {attempt.answers.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  {a.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-gray-700">{a.question?.text}</p>
                    <p
                      className={`text-xs mt-0.5 ${a.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                    >
                      Your answer: {a.selectedOption?.text ?? 'Not answered'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate(`/quizzes/${quizId}/attempt`)}
            className="btn-secondary gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
        </div>
      )}

      {attempts && attempts.length > 1 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Attempt History</h2>
          <div className="space-y-2">
            {attempts.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Attempt {attempts.length - i}</span>
                <span
                  className={`font-medium ${Math.round((a.score / a.totalPoints) * 100) >= 70 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {Math.round((a.score / a.totalPoints) * 100)}% ({a.score}/{a.totalPoints})
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(a.submittedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
