const {
  customerIdSchema,
  serialNumberSchema,
  mpxnSchema,
  readSchema,
  readDateSchema
} = require("./ajvSchemas");

const { POST_BODY_REQUIRED_FIELDS } = require("../../lib/constants");

const postBodySchema = {
  type: "object",
  properties: {
    customerId: customerIdSchema,
    serialNumber: serialNumberSchema,
    mpxn: mpxnSchema,
    read: readSchema,
    readDate: readDateSchema
  },
  required: POST_BODY_REQUIRED_FIELDS,
  additionalProperties: false
};

module.exports = postBodySchema;
