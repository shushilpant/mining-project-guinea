import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'viewer';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null,
      login: (role: UserRole) => set({ isAuthenticated: true, role }),
      logout: () => set({ isAuthenticated: false, role: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
