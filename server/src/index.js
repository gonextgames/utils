import { ensureServerEnvironment } from './browserCheck.js';

export {
  getUserFromToken,
  loginWithEmailAndPasswordAndSetToken,
  registerUserAndSetToken,
} from './auth/serverSideAuth.js';

export {
    getUser,
    getUsersByIds,
    updateUser,
    deleteUser,
    getUserByEmail,  
} from './auth/users.js';

// Wrap exports that use Node-specific modules
export const dynamoDb = () => {
  ensureServerEnvironment('dynamoDb');
  return require('./dynamoDb.js').dynamoDb;
};

export const sendEmail = async (...args) => {
  ensureServerEnvironment('sendEmail');
  return (await import('./email.js')).sendEmail(...args);
};

export const getChatCompletion = async (...args) => {
  ensureServerEnvironment('getChatCompletion');
  return (await import('./openAI.js')).getChatCompletion(...args);
};

export const s3Operations = {
  getByGuid: async (...args) => {
    ensureServerEnvironment('getByGuid');
    return (await import('./s3.js')).getByGuid(...args);
  },
  generateMd5HashFromImage: async (...args) => {
    ensureServerEnvironment('generateMd5HashFromImage');
    return (await import('./s3.js')).generateMd5HashFromImage(...args);
  },
  uploadImage: async (...args) => {
    ensureServerEnvironment('uploadImage');
    return (await import('./s3.js')).uploadImage(...args);
  },
  uploadPdf: async (...args) => {
    ensureServerEnvironment('uploadPdf');
    return (await import('./s3.js')).uploadPdf(...args);
  }
};

