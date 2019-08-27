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
    this.message = "Found existing record(s) matching the idempotency key";
    this.idempotencyKey = idempotencyKey;
    Error.captureStackTrace(this, IdempotencyError);
  }
}

class DuplicateError extends Error {
  constructor(body) {
    super(body);
    this.name = "DuplicateError";
    this.message = "Found existing record(s) matching the provided data";
    this.body = body;
    Error.captureStackTrace(this, DuplicateError);
  }
}

module.exports = { ValidationError, IdempotencyError, DuplicateError };
