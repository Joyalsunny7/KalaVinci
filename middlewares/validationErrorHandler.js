// Validation error handling middleware

/**
 * Validation error handler
 * Handles validation errors and formats them for display
 */
export const validationErrorHandler = (req, res, next) => {
  // Check for validation errors in request
  if (req.validationErrors) {
    const firstError = Object.values(req.validationErrors)[0];
    return res.status(400).json({
      success: false,
      error: firstError
    });
  }
  next();
};

/**
 * Request validation middleware
 * Validates request body, query, and params
 */
export const validateRequest = (validations) => {
  return (req, res, next) => {
    const errors = {};

    // Validate body
    if (validations.body) {
      for (const [field, validator] of Object.entries(validations.body)) {
        const result = validator(req.body[field]);
        if (!result.valid) {
          errors[field] = result.message;
        }
      }
    }

    // Validate query
    if (validations.query) {
      for (const [field, validator] of Object.entries(validations.query)) {
        const result = validator(req.query[field]);
        if (!result.valid) {
          errors[field] = result.message;
        }
      }
    }

    // Validate params
    if (validations.params) {
      for (const [field, validator] of Object.entries(validations.params)) {
        const result = validator(req.params[field]);
        if (!result.valid) {
          errors[field] = result.message;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      req.validationErrors = errors;
      return validationErrorHandler(req, res, next);
    }

    next();
  };
};

