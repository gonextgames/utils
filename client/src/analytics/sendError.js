export const sendError = async (error, route, additionalContext = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
    return;
  }

  try {
    const errorInfo = error instanceof Error ? {
      type: error.name,
      message: error.message,
      stacktrace: error.stack
    } : {
      type: 'UnknownError',
      message: String(error)
    };

    await fetch('https://api.templative.net/logging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: errorInfo,
        route,
        additionalContext
      })
    });
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
}; 