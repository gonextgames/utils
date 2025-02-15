import jwt from 'jsonwebtoken'
import { getUser, getUserByEmail } from './users'
import { comparePasswords } from './passwordHashing'

const JWT_SECRET = process.env.JWT_SECRET_KEY

export async function generateToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  } catch (error) {
    console.error('Error in generateToken:', error)
    throw error
  }
}

export async function verifyToken(token) {
  try {
    const decodedToken = decodeURIComponent(token)
    const verified = jwt.verify(decodedToken, JWT_SECRET)
    
    // Add additional validation
    if (!verified.user_id || !verified.exp) {
      return null
    }
    
    // Check if token is about to expire (within 5 minutes)
    const fiveMinutes = 5 * 60 * 1000
    if (verified.exp * 1000 - Date.now() < fiveMinutes) {
      // Token about to expire, could trigger refresh here
      return null
    }
    
    return verified
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getUserFromToken(cookies) {
  try {
    const token = cookies.get("ftt_token")?.value
    if (!token) {
      console.warn('No token found in cookies')
      return null
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.user_id) {
      console.warn('Invalid or expired token')
      cookies.delete("ftt_token")
      return null
    }

    const user = await getUser(decoded.user_id)
    
    if (!user) {
      console.warn('User not found in database')
      cookies.delete("ftt_token")
      return null
    }

    const { password, ...safeUser } = user
    return safeUser
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

export async function hydrateUserUsingEmailAndPassword(email, password) {
  try {
    const user = await getUserByEmail(email)
    if (!user) {
      console.warn('User not found for email:', email)
      throw new Error('User not found')
    }
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      console.warn('Invalid password for user:', email)
      throw new Error('Invalid password')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
    
  } catch (error) {
    console.error('Error in hydrateUserUsingEmailAndPassword:', {
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}