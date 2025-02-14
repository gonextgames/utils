import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../clients/dynamoDb';
import { hashPassword } from './passwordHashing';
import { v4 as uuidv4 } from 'uuid';

export async function createUser(id, name, email, hashedPassword, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    const item = {
      user_id: id,
      name,
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await dynamoDb.send(new PutCommand({
      TableName: tableName,
      Item: item,
    }));
    
    return item;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function getUser(userId, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    const result = await dynamoDb.send(new GetCommand({
      TableName: tableName,
      Key: { user_id: userId },
    }));
  
    return result.Item;
  } catch (error) {
    console.error('Error in getUser:', error);
    throw error;
  }
}

export async function updateUser(id, updates, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
    expressionAttributeNames[`#${key}`] = key;
  });

  const result = await dynamoDb.send(new UpdateCommand({
    TableName: tableName,
    Key: { user_id: id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW',
  }));
  
  return result.Attributes;
} catch (error) {
  console.error('Error in updateUser:', error);
  throw error;
}
}

export async function deleteUser(id, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    await dynamoDb.send(new DeleteCommand({
      TableName: tableName,
      Key: { id },
    }));
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
}

export async function getUserByEmail(email, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    const result = await dynamoDb.send(new QueryCommand({
    TableName: tableName,
    IndexName: 'email-user_id-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
    Limit: 1
  }));
  
  return result.Items[0];
} catch (error) {
  console.error('Error in getUserByEmail:', error);
  throw error;
}
}

export async function registerUser(userData, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    const { email, password, name } = userData
    
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

    await createUser(user.user_id, user.name, user.email, user.password, tableName)

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
    
  } catch (error) {
    console.error('Error in registerUser:', {
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

export async function getUsersByIds(userIds, tableName) {
  if (!tableName) throw new Error('Table name is required');
  try {
    // If no userIds provided, return empty array
    if (!userIds || userIds.length === 0) {
      return [];
    }

  // DynamoDB only allows 25 items per BatchGetItem
  const batchSize = 25;
  let allUsers = [];

  // Process users in batches
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    
    const result = await dynamoDb.send(new BatchGetCommand({
      RequestItems: {
        [tableName]: {
          Keys: batch.map(id => ({ user_id: id }))
        }
      }
    }));

    if (result.Responses && result.Responses[tableName]) {
      // Remove sensitive data from users
      const safeUsers = result.Responses[tableName].map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      allUsers = [...allUsers, ...safeUsers];
    }
  }

  return allUsers;
} catch (error) {
  console.error('Error in getUsersByIds:', error);
  throw error;
}
}

