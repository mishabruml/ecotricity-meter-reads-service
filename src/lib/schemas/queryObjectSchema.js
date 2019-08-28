const {
  customerIdSchema,
  serialNumberSchema,
  mpxnSchema,
  readDateSchema,
  createdAtSchema
} = require("./ajvSchemas");

const queryObjectSchema = {
  type: "object",
  properties: {
    customerId: customerIdSchema,
    serialNumber: serialNumberSchema,
    mpxn: mpxnSchema,
    readDate: readDateSchema,
    createdAt: createdAtSchema
  },
  additionalProperties: false
};

module.exports = queryObjectSchema;
