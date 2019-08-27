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

class IdempotencyError extends Error {
  constructor(idempotencyKey) {
    super(idempotencyKey);
    this.name = "IdempotencyError";
    this.message = "An existing record matching the idempotency key was found";
    this.idempotencyKey = idempotencyKey;
    Error.captureStackTrace(this, IdempotencyError);
  }
}

module.exports = { ValidationError, IdempotencyError };
