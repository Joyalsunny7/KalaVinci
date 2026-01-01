// Error handling middleware

/**
 * Global error handler middleware
 * Handles all errors and sends appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).render('error', {
      error: errors.join(', '),
      statusCode: 400
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).render('error', {
      error: `${field} already exists`,
      statusCode: 400
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).render('error', {
      error: 'Invalid ID format',
      statusCode: 400
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).render('error', {
      error: 'Invalid token',
      statusCode: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).render('error', {
      error: 'Token expired',
      statusCode: 401
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // If it's an API request (JSON), send JSON response
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: message
    });
  }

  // For view rendering, try to render error page
  // If error view doesn't exist, send simple HTML response
  try {
    res.status(statusCode).render('error', {
      error: message,
      statusCode: statusCode
    });
  } catch (renderError) {
    // Fallback if error view doesn't exist
    res.status(statusCode).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error ${statusCode}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #e74c3c; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <h1>Error ${statusCode}</h1>
        <p>${message}</p>
        <a href="/home">Go Home</a>
      </body>
      </html>
    `);
  }
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  // Skip 404 for static assets (CSS, JS, images, etc.)
  if (
    req.path.startsWith('/css/') ||
    req.path.startsWith('/js/') ||
    req.path.startsWith('/images/') ||
    req.path.startsWith('/uploads/') ||
    req.path.startsWith('/favicon.ico')
  ) {
    return res.status(404).send('File not found');
  }

  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

