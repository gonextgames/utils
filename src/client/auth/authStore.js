import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  refreshing: false,
  lastVerified: null,
  error: null,
  setAuth: (user) => {
    set({ user, isAuthenticated: true, isLoading: false })
  },
  clearAuth: () => {
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  setLoading: (loading) => {
    set({ isLoading: loading })
  }
}))