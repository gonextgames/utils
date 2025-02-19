// pages/api/auth/verify.js
import { getUserFromToken } from '@gonextgames/utils/server'

export default async function handler(req, res) {
  const user = await getUserFromToken('users_table', 'auth_token')
  // ...
}

// app/components/LoginForm.jsx
'use client'
import { useAuth } from '@gonextgames/utils/client'

export function LoginForm() {
  const { login, isLoading } = useAuth()
  // ...
}

// app/layout.jsx
import { AuthProvider } from '@gonextgames/utils/client'

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 