// Custom error classes

class ValidationError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "ValidationError";
    this.ajvErrors = ajvErrors;
    Error.captureStackTrace(this, ValidationError);
  }
}

class InvalidDataError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, InvalidDataError);
  }
}

module.exports = { InvalidDataError, ValidationError };
