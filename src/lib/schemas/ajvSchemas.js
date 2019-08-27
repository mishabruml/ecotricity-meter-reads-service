// ajv schemas, one for each data field. Individual, and modular; can be used to create other schema
// Used heavily in request and data validation

const {
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REGISTER_ID_LENGTH,
  READ_VALUE_MIN,
  READ_VALUE_MAX,
  REQUIRED_READ_TYPES
} = require("../constants");

// registerId sub-schema shared for all 'read' entries
const registerIdSchema = {
  type: "string",
  minLength: REGISTER_ID_LENGTH,
  maxLength: REGISTER_ID_LENGTH,
  pattern: `^\\w{${REGISTER_ID_LENGTH}}$` //alphanumeric
};

// read value sub-schema shared for all 'read' entries
const readValueSchema = {
  type: "number",
  minimum: READ_VALUE_MIN,
  maximum: READ_VALUE_MAX
};

// Create the schema for each item in 'read' - one entry required per required read type specified
const readItemsSchema = REQUIRED_READ_TYPES.map(readType => {
  return {
    type: "object",
    properties: {
      type: { enum: [readType] },
      registerId: registerIdSchema,
      value: readValueSchema
    },
    required: ["type", "registerId", "value"],
    additionalProperties: false
  };
});

const customerIdSchema = {
  type: "string",
  format: "uuid"
};

const serialNumberSchema = {
  type: "string",
  minLength: SERIAL_NUMBER_LENGTH,
  maxLength: SERIAL_NUMBER_LENGTH,
  pattern: `^\\d{${SERIAL_NUMBER_LENGTH}}$` // digits only
};

const mpxnSchema = {
  type: "string",
  minLength: MPXN_LENGTH,
  maxLength: MPXN_LENGTH,
  pattern: `^\\w{${MPXN_LENGTH}}$` //alphanumeric
};

const readSchema = {
  type: "array",
  items: readItemsSchema,
  additionalItems: false,
  minItems: REQUIRED_READ_TYPES.length
};
const readDateSchema = { type: "string", format: "date-time" };

module.exports = {
  registerIdSchema,
  readValueSchema,
  readItemsSchema,
  customerIdSchema,
  serialNumberSchema,
  mpxnSchema,
  readSchema,
  readDateSchema
};
