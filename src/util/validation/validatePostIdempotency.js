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
  let valid = ajv.validate(idempotencyKeySchema, idempotencyKey);
  if (!valid) {
    console.log("idk invalid");
    console.error(ajv.errors);
    throw new ValidationError(
      `idempotency-key header ${ajv.errorsText()}`,
      (ajvErrors = ajv.errors)
    );
  }

  const result = await readingModelController.getAllByIdempotencyKey(
    idempotencyKey
  );

  if (result.length) {
    valid = false;
    throw new IdempotencyError(idempotencyKey);
  }

  return valid;
};

module.exports = validatePostIdempotency;
