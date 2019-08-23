// Custom error classes

class MissingParameterError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, MissingParameterError);
  }
}

class InvalidDataError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, InvalidDataError);
  }
}

module.exports = { InvalidDataError, MissingParameterError };
