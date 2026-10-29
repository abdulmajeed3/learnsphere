import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { isAuthenticated, user } = useAuthStore();
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  });

  const onSubmit = (data: FormData) => register_.mutate(data);

  const errorMsg = register_.error
    ? ((register_.error as any)?.response?.data?.message ?? 'Registration failed')
    : null;

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-10 w-10 text-primary-600 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start learning today — it's free</p>
        </div>

        <div className="card p-8">
          {errorMsg && <Alert message={errorMsg} className="mb-4" />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {(['STUDENT', 'INSTRUCTOR'] as const).map((r) => (
                  <label key={r} className="relative flex cursor-pointer">
                    <input type="radio" value={r} {...register('role')} className="peer sr-only" />
                    <div className="w-full rounded-lg border border-gray-200 p-3 text-center text-sm font-medium text-gray-600 transition peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:bg-gray-50">
                      {r === 'STUDENT' ? '📚 Learn' : '🎓 Teach'}
                      <div className="text-xs font-normal mt-0.5 text-gray-400">
                        {r === 'STUDENT' ? 'as Student' : 'as Instructor'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="input"
                placeholder="Min. 8 characters"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={register_.isPending}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {register_.isPending ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
