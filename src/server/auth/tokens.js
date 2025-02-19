'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET_KEY

export async function getUserIdAndEmailFromToken(tokenName) {
  const cookieStore = await cookies()
  const token = cookieStore.get(tokenName)?.value
  if (!token) return null

  const decodedToken = decodeURIComponent(token)
  const verifiedUser = jwt.verify(decodedToken, JWT_SECRET)
  
  if (!verifiedUser || !verifiedUser.user_id || !verifiedUser.exp || !verifiedUser.email) {
    console.warn('Invalid or expired token', verifiedUser)
    return null
  }
  
  const fiveMinutes = 5 * 60 * 1000
  if (verifiedUser.exp * 1000 - Date.now() < fiveMinutes) {
    cookieStore.delete(tokenName)
    return null
  }
  
  return verifiedUser
}

export async function setToken(tokenName, userId, email) {
  const payload = { user_id: userId, email: email }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  const cookieStore = cookies()
  cookieStore.set(tokenName, token, {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
} 