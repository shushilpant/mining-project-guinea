import { create } from 'zustand';

export type UserRole = 'admin' | 'viewer';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  role: 'admin',
  login: (role: UserRole) => set({ isAuthenticated: true, role }),
  logout: () => set({ isAuthenticated: true, role: 'admin' }),
}));
