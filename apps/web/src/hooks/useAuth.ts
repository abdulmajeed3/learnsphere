import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import type { LoginPayload, RegisterPayload } from '@/api/auth';

export function useCurrentUser() {
  const { isAuthenticated, clearAuth } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        clearAuth();
        throw new Error('Unauthorized');
      }
    },
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      qc.setQueryData(['me'], res.user);
      navigate(res.user.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/dashboard');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      qc.setQueryData(['me'], res.user);
      navigate(res.user.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/dashboard');
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      qc.clear();
      navigate('/login');
    },
  });
}
