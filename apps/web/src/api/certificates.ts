import api from '@/lib/axios';
import type { Certificate } from '@/types';

export const certificatesApi = {
  claim: (courseId: string) =>
    api.post<Certificate>(`/certificates/claim/${courseId}`).then((r) => r.data),
  listMine: () => api.get<Certificate[]>('/certificates/my').then((r) => r.data),
  verify: (code: string) =>
    api.get<Certificate>(`/certificates/verify/${code}`).then((r) => r.data),
};
