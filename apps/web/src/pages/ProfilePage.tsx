import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/stores/authStore';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '', bio: user?.bio ?? '', avatarUrl: user?.avatarUrl ?? '' },
  });

  const update = useMutation({
    mutationFn: (data: FormData) =>
      usersApi.updateProfile({
        name: data.name,
        bio: data.bio || undefined,
        avatarUrl: data.avatarUrl || undefined,
      }),
    onSuccess: (updated) => {
      updateUser(updated);
      qc.setQueryData(['me'], updated);
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge-blue text-xs mt-1">{user?.role}</span>
          </div>
        </div>

        {update.isSuccess && (
          <Alert variant="success" message="Profile updated successfully!" className="mb-4" />
        )}
        {update.isError && (
          <Alert
            message={(update.error as any)?.response?.data?.message ?? 'Update failed'}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" {...register('name')} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              className="input min-h-24 resize-y"
              placeholder="Tell students about yourself..."
              {...register('bio')}
            />
          </div>

          <div>
            <label className="label">Avatar URL</label>
            <input className="input" placeholder="https://..." {...register('avatarUrl')} />
            {errors.avatarUrl && (
              <p className="text-xs text-red-600 mt-1">{errors.avatarUrl.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={update.isPending} className="btn-primary">
              {update.isPending ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
