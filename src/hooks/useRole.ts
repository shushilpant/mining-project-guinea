import { useAuthStore } from '@/store/authStore';

export function useRole() {
  const role = useAuthStore((state) => state.role);
  return {
    role,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
  };
}
