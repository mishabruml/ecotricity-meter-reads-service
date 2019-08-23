// Custom error class

// function ItemAlreadyExistsError(item, itemType) {
//   Error.captureStackTrace(this);
//   this.name = "ItemAlreadyExistsError";
//   this.item = item;
//   this.itemType = itemType;
//   this.message = `The ${itemType ? itemType : "item"} already exists`;
// }
// ItemAlreadyExistsError.prototype = Object.create(Error.prototype);
// module.exports.ItemAlreadyExistsError = ItemAlreadyExistsError;

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
