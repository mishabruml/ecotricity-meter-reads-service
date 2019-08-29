/* Validates the idempotency key format and checks for 
existing records with incoming idempotency key,
indicating network duplication. The data itself
is checked for duplicate records in another module */

const { ValidationError, IdempotencyError } = require("../../lib/errors");
const ReadingModelController = require("../../db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

const Ajv = require("ajv");
var ajv = Ajv({ allErrors: true });

const idempotencyKeySchema = {
  type: "string",
  format: "uuid"
};

const validatePostIdempotency = async idempotencyKey => {
  // validate the idempotencyKey format
  let valid = ajv.validate(idempotencyKeySchema, idempotencyKey);
  if (!valid) {
    // console.log("idk invalid");
    // console.error(ajv.errors);
    throw new ValidationError(
      `Request header Idempotency-Key ${ajv.errorsText()}`,
      (ajvErrors = ajv.errors)
    );
  }

  const existingIdempotencyKeys = await readingModelController.getAllByIdempotencyKey(
    idempotencyKey
  );

  if (existingIdempotencyKeys.length) {
    valid = false;
    throw new IdempotencyError(idempotencyKey);
  }

  return valid;
};

module.exports = validatePostIdempotency;
