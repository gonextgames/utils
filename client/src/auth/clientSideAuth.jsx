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

  const checkAuth = async () => {
    const randomNumber = Math.floor(Math.random()*100)
    // if (useAuthStore.getState().isLoading) {
    //   console.warn('[Auth] Already loading', randomNumber)
    //   return // Prevent concurrent checks
    // }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      })

      if (!response.ok) {
        console.warn('[Auth] Verification failed', randomNumber)
        throw new Error('Verification failed', randomNumber)
      }

      const data = await response.json()
      console.log('[Auth] Verification successful', data)
      if (!data.authenticated) {
        console.warn('[Auth] Not authenticated', randomNumber)
        clearAuth()
        return
      }

      if (!data.user || !data.user.user_id) {
        console.warn('[Auth] Invalid user data', randomNumber)
        throw new Error('Invalid user data', randomNumber)
      }
      
      setAuth(data.user)
    } catch (error) {
      console.error('[Auth] Check failed:', error, randomNumber)
      setError(error)
      clearAuth()
    } finally {
      setLoading(false)
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
      const from = params.get('from') || "/"
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

// Export the hook directly with the function declaration
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