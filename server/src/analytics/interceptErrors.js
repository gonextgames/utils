import { sendError } from './sendError';
const originalConsoleError = console.error;

const generateCorrelationId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
};

export const interceptErrors = (applicationLayer) => {
  if (!applicationLayer) {
    throw new Error('Application layer must be specified when initializing error logging');
  }

  console.error = async (...args) => {
    originalConsoleError.apply(console, args);

    try {
      const error = args.find(arg => arg instanceof Error) || new Error(
        args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
      );

      await sendError(error, 'server_error', {
        application_layer: applicationLayer,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        correlation_id: generateCorrelationId()
      });
    } catch (loggingError) {
      originalConsoleError('Error logging failed:', loggingError);
    }
  };

  // Set up global error handlers
  process.on('uncaughtException', (error) => {
    console.error(error);
    // Give the console.error time to send before exiting
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
  });
};
