'use server'

import { getUser, getUserByEmail, createUser } from '../users'
import { comparePasswords } from './passwordHashing.js'
import { v4 as uuidv4 } from 'uuid';

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

export async function loginWithEmailAndPasswordAndSetToken(email, password, tableName, tokenName) {
  try {
    if (!tableName) throw new Error('Table name is required to loginWithEmailAndPasswordAndSetToken.');
    if (!tokenName) throw new Error('Token name is required to loginWithEmailAndPasswordAndSetToken.');
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
    console.error('Error in loginWithEmailAndPasswordAndSetToken:', error.message)
    throw error
  }
}
export async function registerUserAndSetToken(name, email, password, otherData, tableName) {
  try {
    if (!tableName) throw new Error('Table name is required');
    
    // Check if user exists
    const existingUser = await getUserByEmail(email, tableName)
    if (existingUser) {
      console.warn('Email already registered:', email)
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user object with user_id
    const user = {
      user_id: uuidv4(),
      name,
      email: email,
      contact_email: email,
      password: hashedPassword,
    }

    await createUser(user.user_id, user.name, user.email, user.password, otherData, tableName)
    await setToken('token', user.user_id, user.email)
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
    
  } catch (error) {
    console.error('Error in registerUserAndSetToken:', {
      message: error.message,
      stack: error.stack
    })
    throw new Error('An error occurred while registering the user');
  }
}
