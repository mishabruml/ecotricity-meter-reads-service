const { MissingParameterError, InvalidDataError } = require("../lib/errors");

const {
  CUSTOMER_ID_UUID_VERSION,
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REQUIRED_READ_TYPES
} = require("../lib/constants");

const { expect } = require("chai");
const _ = require("a");

const validator = require("validator");

const validatePostBody = body => {
  if (!body) throw new MissingParameterError("body");
  try {
    // use chai to check all expected keys are present
    expect(body).to.have.all.keys(
      "customerId",
      "serialNumber",
      "mpxn",
      "read",
      "readDate"
    );
  } catch (e) {
    console.log(e);
    // grab any missing parameters by diffing actual:expected arrays from the chai error, and throw custom error
    const missingParams = e.expected.filter(x => !e.actual.includes(x)).join();
    throw new MissingParameterError(missingParams);
  }
  const { customerId, serialNumber, mpxn, read, readDate } = body;
  if (!validator.isUUID(customerId, CUSTOMER_ID_UUID_VERSION))
    throw new InvalidDataError(
      `customerId must be uuidv${CUSTOMER_ID_UUID_VERSION}`
    );
  if (
    !validator.isAlphanumeric(serialNumber) ||
    serialNumber.length !== SERIAL_NUMBER_LENGTH
  )
    throw new InvalidDataError(
      `serialNumber must be ${SERIAL_NUMBER_LENGTH}-characater alphanumeric`
    );
  if (!validator.isNumeric(mpxn) || mpxn.length !== MPXN_LENGTH) {
    throw new InvalidDataError(
      `mpxn must be a ${MPXN_LENGTH}-character number`
    );
  }
  if (!Array.isArray(read))
    throw new InvalidDataError("'read' must be an object array");

  if (read.length !== REQUIRED_READ_TYPES.length) {
    throw new InvalidDataError(
      `'read' must have ${REQUIRED_READ_TYPES.length} entries`
    );
  }

  const readTypes = read.map(reading => {
    return reading.type;
  });

  console.log(readTypes.sort() === REQUIRED_READ_TYPES.sort());

  read.forEach(reading => {
    if (REQUIRED_READ_TYPES.indexOf(reading.type) === -1)
      throw new InvalidDataError(
        `'read' allowed types are ${REQUIRED_READ_TYPES.toString()}`
      );
  });
};

module.exports = validatePostBody;
