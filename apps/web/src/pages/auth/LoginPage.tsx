import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { isAuthenticated, user } = useAuthStore();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login.mutate(data);

  const errorMsg = login.error
    ? ((login.error as any)?.response?.data?.message ?? 'Login failed')
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your LearnSphere account</p>
        </div>

        <div className="card p-8">
          {errorMsg && <Alert message={errorMsg} className="mb-4" />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {login.isPending ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            <strong>Demo accounts:</strong>
            <br />
            Student: student@learnsphere.dev / password123
            <br />
            Instructor: instructor@learnsphere.dev / password123
          </div>
        </div>
      </div>
    </div>
  );
}
