import { compare, hash } from 'bcryptjs'

export async function hashPassword(password) {
    try {  
      return await hash(password, 10)
    } catch (error) {
      console.error('Error in hashPassword:', error)
      throw error
    }
  }
  
export async function comparePasswords(password, hashedPassword) {
    try {
        return await compare(password, hashedPassword)
    } catch (error) {
        console.error('Error in comparePasswords:', {
        message: error.message,
        stack: error.stack
        })
        throw error
    }
}