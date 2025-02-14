import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  refreshing: false,
  lastVerified: null,
  error: null,
  setAuth: (user) => {
    console.log('Setting auth user:', user)
    set({ user, isAuthenticated: true, isLoading: false })
  },
  clearAuth: () => {
    console.log('Clearing auth state')
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  setLoading: (loading) => {
    console.log('Setting auth loading:', loading)
    set({ isLoading: loading })
  }
}))