// Custom error classes

// Error to be thrown when invalid data encountered
class ValidationError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "ValidationError";
    this.ajvErrors = ajvErrors;
    Error.captureStackTrace(this, ValidationError);
  }
}

module.exports = { ValidationError };
