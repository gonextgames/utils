import jwt from 'jsonwebtoken'
import { getUser, getUserByEmail } from './users.js'
import { comparePasswords } from './passwordHashing.js'

const JWT_SECRET = process.env.JWT_SECRET_KEY

async function getCookieStore() {
  try {
    // Try to use Next.js cookies if available
    const { cookies } = await import('next/headers');
    return cookies();
  } catch (error) {
    // Fallback implementation for non-Next.js environments
    return {
      get: (name) => {
        // Implement your fallback cookie getting logic here
        throw new Error('Cookie management not implemented for this environment');
      },
      set: (name, value, options) => {
        // Implement your fallback cookie setting logic here
        throw new Error('Cookie management not implemented for this environment');
      },
      delete: (name) => {
        // Implement your fallback cookie deletion logic here
        throw new Error('Cookie management not implemented for this environment');
      }
    };
  }
}

async function setToken(tokenName, userId, email) {
  try {
    const payload = { user_id: userId, email: email }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
    const cookieStore = await getCookieStore()
    cookieStore.set(tokenName, token, {
      httpOnly: true,
      secure: process.env.ENVIRONMENT === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
  } catch (error) {
    console.error('Error in generateToken:', error.message)
    throw error
  }
}

async function getUserIdAndEmailFromToken(tokenName) {
  const cookieStore = await getCookieStore()
  const token = cookieStore.get(tokenName)?.value
  if (!token) {
    // console.warn('No token found in cookies')
    return null
  }

  const decodedToken = decodeURIComponent(token)
  const verifiedUser = jwt.verify(decodedToken, JWT_SECRET)
  
  // Add additional validation
  if (!verifiedUser || !verifiedUser.user_id || !verifiedUser.exp || !verifiedUser.email) {
    console.warn('Invalid or expired token', verifiedUser)
    return null
  }
  
  // Check if token is about to expire (within 5 minutes)
  const fiveMinutes = 5 * 60 * 1000
  if (verifiedUser.exp * 1000 - Date.now() < fiveMinutes) {
    // Token about to expire, could trigger refresh here
    cookieStore.delete(tokenName)
    return null
  }
  
  return verifiedUser
}

export async function getUserFromToken(tableName, tokenName) {
  try {
    if (!tableName) throw new Error('Table name is required to getUserFromToken.');
    
    const verifiedUser = await getUserIdAndEmailFromToken(tokenName)
    if (!verifiedUser || !verifiedUser.user_id || !verifiedUser.email) {
      console.warn('No user ID or email found in token', verifiedUser)
      return null
    }
    const user = await getUser(verifiedUser.user_id, tableName)
    
    if (!user) {
      console.warn('User not found in database')
      cookieStore.delete(tokenName)
      return null
    }
    if (user.email !== verifiedUser.email) {
      console.warn('User email mismatch')
      cookieStore.delete(tokenName)
      return null
    }

    const { password, ...safeUser } = user
    return safeUser
  } catch (error) {
    console.error('Auth check failed:', error.message)
    return null
  }
}

export async function loginWithEmailAndPassword(email, password, tableName, tokenName) {
  try {
    if (!tableName) throw new Error('Table name is required to loginWithEmailAndPassword.');
    if (!tokenName) throw new Error('Token name is required to loginWithEmailAndPassword.');
    const user = await getUserByEmail(email, tableName)
    if (!user) {
      console.warn('User not found for email:', email)
      throw new Error('User not found')
    }
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      console.warn('Invalid password for user:', email)
      throw new Error('Invalid password')
    }

    await setToken(tokenName, user.user_id, user.email)
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
    
  } catch (error) {
    console.error('Error in loginWithEmailAndPassword:', error.message)
    throw error
  }
}