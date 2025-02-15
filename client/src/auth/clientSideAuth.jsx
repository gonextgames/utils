"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from './authStore'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const { setAuth, clearAuth, setLoading, setError } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Only check auth on initial mount
    const initialCheck = async () => {
      console.log('[Auth] Initial check')
      // Skip auth check on login/register pages
      if (window.location.pathname === '/login' || 
          window.location.pathname === '/register') {
        setLoading(false)
        return
      }
      await checkAuth()
    }
    initialCheck()
  }, []) // Remove checkAuth from dependencies

  // Modify route change handler
  useEffect(() => {
    const handleRouteChange = () => {
      // Only check auth on protected routes
      const isProtectedRoute = ['/conversations', '/account', '/getting-started']
        .some(route => window.location.pathname.startsWith(route))
      if (isProtectedRoute) {
        console.log('[Auth] Protected route detected')
        checkAuth()
      }
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const checkAuth = async () => {
    const randomNumber = Math.floor(Math.random()*100)
    console.log('[Auth] Checking auth', randomNumber)
    if (useAuthStore.getState().isLoading) {
      console.log('[Auth] Already loading', randomNumber)
      return // Prevent concurrent checks
    }
    console.log('[Auth] Starting auth check', randomNumber)
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Verification failed', randomNumber)
      }

      const data = await response.json()
      
      if (!data.authenticated) {
        clearAuth()
        return
      }

      if (!data.user || !data.user.user_id) {
        throw new Error('Invalid user data', randomNumber)
      }
      
      setAuth(data.user)
    } catch (error) {
      console.error('[Auth] Check failed:', error, randomNumber)
      setError(error)
      clearAuth()
    } finally {
      setLoading(false)
      console.log('[Auth] Finished auth check', randomNumber)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) throw new Error('Login failed')
      
      const data = await response.json()
      
      // Update auth state
      await setAuth(data.user)
      
      // Verify auth state is set
      const verifyResponse = await fetch('/api/auth/verify')
      if (!verifyResponse.ok) throw new Error('Auth verification failed')
      
      // Only redirect after confirmation
      const params = new URLSearchParams(window.location.search)
      const from = params.get('from') || '/conversations'
      console.log('[Auth] Redirecting to:', from)
      router.push(from)
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearAuth()
      router.push('/')
    }
  }

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setAuth(data.user)
      router.push('/getting-started')
    } catch (error) {
      throw error
    }
  }


  const value = {
    isAuthenticated: useAuthStore().isAuthenticated,
    user: useAuthStore().user,
    isLoading: useAuthStore().isLoading,
    login,
    logout,
    register
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { login, logout, register } = useContext(AuthContext)
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  }
}