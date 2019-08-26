const postBodySchema = require("./postBodySchema");
const { ValidationError } = require("../../lib/errors");

// JSON schema validation library - bulk of heavy lifting is done by the schema!
const Ajv = require("ajv");
var ajv = Ajv({ allErrors: true });

const validatePostBody = body => {
  const valid = ajv.validate(postBodySchema, body);
  if (!valid) {
    // console.log("Data invalid");
    // console.error(ajv.errors);
    throw new ValidationError(ajv.errorsText(), (ajvErrors = ajv.errors));
  }

  // continue...

  return valid;
};

module.exports = validatePostBody;
