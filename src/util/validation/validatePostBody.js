const postBodySchema = require("./postBodySchema");

const { DataParameterError, InvalidDataError } = require("../../lib/errors");

const {
  CUSTOMER_ID_UUID_VERSION,
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REQUIRED_READ_TYPES,
  REGISTER_ID_LENGTH,
  READ_VALUE_MIN,
  READ_VALUE_MAX,
  READ_VALUE_ALLOW_LEADING_ZEROS
} = require("../../lib/constants");

const { expect } = require("chai");
const _ = require("lodash");

// Json schema validattion library
const Ajv = require("ajv");
var ajv = Ajv({ allErrors: true });

const validator = require("validator");

const validatePostBody = body => {
  var valid = ajv.validate(postBodySchema, body);
  if (!valid) {
    console.log("Data invalid");
    console.log(ajv.errors);
    throw new DataParameterError(ajv.errorsText());
  }

  // continue...

  return;

  if (!body) throw new DataParameterError("body");
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
    throw new DataParameterError(missingParams);
  }

  // destructure body into the data we need
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

  const validateRead = read => {
    if (!Array.isArray(read))
      throw new InvalidDataError("'read' must be an object array");

    if (read.length !== REQUIRED_READ_TYPES.length) {
      throw new InvalidDataError(
        `'read' must have ${REQUIRED_READ_TYPES.length} entries`
      );
    }

    read.forEach(reading => {
      try {
        expect(reading).to.have.keys("type", "registerId", "value");
      } catch (e) {
        console.error(e);
        const missingReadParams = e.expected
          .filter(x => !e.actual.includes(x))
          .join();
        throw new DataParameterError(
          `'read' missing key(s): '${missingReadParams}'`
        );
      }
    });

    const readTypes = read.map(reading => {
      return reading.type;
    });
    if (!_.isEqual(readTypes.sort(), REQUIRED_READ_TYPES.sort()))
      throw new InvalidDataError(
        `'read' required types are ${REQUIRED_READ_TYPES.toString()}`
      );

    const registerIds = read.map(reading => {
      return reading.registerId;
    });

    registerIds.forEach(registerId => {
      if (
        !validator.isAlphanumeric(registerId) ||
        registerId.length !== REGISTER_ID_LENGTH
      )
        throw new InvalidDataError(
          `registerId must be ${REGISTER_ID_LENGTH}-characater alphanumeric`
        );
    });

    const readValues = read.map(reading => {
      return reading.value;
    });

    readValues.forEach(value => {
      if (
        !validator.isInt(value, {
          min: READ_VALUE_MIN,
          max: READ_VALUE_MAX,
          allow_leading_zeroes: READ_VALUE_ALLOW_LEADING_ZEROS
        })
      )
        throw new InvalidDataError(
          `'read' values must be integer between ${READ_VALUE_MIN} and ${READ_VALUE_MAX}. Leading zeros ${
            READ_VALUE_ALLOW_LEADING_ZEROS ? "are" : "not"
          } permitted`
        );
    });
  };

  validateRead(read);
};

module.exports = validatePostBody;
