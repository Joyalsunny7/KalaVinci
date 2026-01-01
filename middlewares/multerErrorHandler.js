// Multer error handling middleware

/**
 * Multer error handler middleware
 * Handles file upload errors from multer
 */
export const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.fileValidationError = 'File size too large. Maximum size is 5MB';
      return next();
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      req.fileValidationError = 'Too many files uploaded';
      return next();
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      req.fileValidationError = 'Unexpected file field';
      return next();
    }

    // Other multer errors
    if (err.message) {
      req.fileValidationError = err.message;
      return next();
    }

    // Generic multer error
    req.fileValidationError = 'File upload error occurred';
    return next();
  }

  next();
};

/**
 * Multer upload wrapper with error handling
 */
export const handleMulterUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return multerErrorHandler(err, req, res, next);
      }
      next();
    });
  };
};

