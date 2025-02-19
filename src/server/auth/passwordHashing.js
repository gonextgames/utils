'use server'

import bcryptjs from 'bcryptjs'

export async function hashPassword(password) {
    try {  
      return await bcryptjs.hash(password, 10)
    } catch (error) {
      console.error('Error in hashPassword:', error)
      throw error
    }
  }
  
export async function comparePasswords(password, hashedPassword) {
    try {
        return await bcryptjs.compare(password, hashedPassword)
    } catch (error) {
        console.error('Error in comparePasswords:', {
        message: error.message,
        stack: error.stack
        })
        throw error
    }
} 