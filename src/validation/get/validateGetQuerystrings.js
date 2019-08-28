const queryObjectSchema = require("../../lib/schemas/queryObjectSchema");
const { QuerystringError } = require("../../lib/errors");

// JSON schema validation library - bulk of heavy lifting is done by the schema!
const Ajv = require("ajv");
var ajv = Ajv({ allErrors: true });

const validateGetQueryStrings = query => {
  const valid = ajv.validate(queryObjectSchema, query);
  if (!valid) {
    // console.log("Data invalid");
    // console.error(ajv.errors);

    throw new QuerystringError(ajv.errorsText(), (ajvErrors = ajv.errors));
  }

  return valid;
};

module.exports = validateGetQueryStrings;
