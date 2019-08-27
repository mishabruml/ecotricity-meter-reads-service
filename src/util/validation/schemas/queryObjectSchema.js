const { SERIAL_NUMBER_LENGTH, MPXN_LENGTH } = require("../../../lib/constants");
const {
  customerIdSchema,
  serialNumberSchema,
  mpxnSchema,
  readDateSchema
} = require("./ajvSchemas");

const queryObjectSchema = {
  type: "object",
  properties: {
    customerId: customerIdSchema,
    serialNumber: serialNumberSchema,
    mpxn: mpxnSchema,
    readDate: readDateSchema
  },
  additionalProperties: false
};

module.exports = queryObjectSchema;
