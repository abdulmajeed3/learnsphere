import api from '@/lib/axios';

export const dashboardApi = {
  student: () => api.get('/dashboard/student').then(r => r.data),
  instructor: () => api.get('/dashboard/instructor').then(r => r.data),
};
