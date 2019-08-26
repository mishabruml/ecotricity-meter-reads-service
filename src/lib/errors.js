// Custom error classes

class DataParameterError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, DataParameterError);
  }
}

class InvalidDataError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, InvalidDataError);
  }
}

module.exports = { InvalidDataError, DataParameterError };
