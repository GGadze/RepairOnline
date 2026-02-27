import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  role: 'client' | 'admin' | null
  isAuthenticated: boolean
  login: (user: User, token: string, role: 'client' | 'admin') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      login: (user, token, role) => set({ user, token, role, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // тот же ключ — api.ts его читает
    }
  )
)