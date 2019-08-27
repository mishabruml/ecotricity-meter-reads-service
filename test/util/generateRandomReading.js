const uuidv4 = require("uuid");
const Chance = require("chance");
const chance = new Chance();
const {
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REQUIRED_READ_TYPES,
  REGISTER_ID_LENGTH,
  READ_VALUE_MIN,
  READ_VALUE_MAX,
  READ_VALUE_ALLOW_LEADING_ZEROS
} = require("../../src/lib/constants");

const generateRandomReading = () => {
  const customerId = uuidv4();
  const idempotencyKey = uuidv4();

  const serialNumber = chance.string({
    length: SERIAL_NUMBER_LENGTH,
    numeric: true
  });
  const mpxn = chance.string({
    length: MPXN_LENGTH,
    numeric: true,
    alpha: true
  });
  const registerId = chance.string({
    length: REGISTER_ID_LENGTH,
    numeric: true,
    alpha: true
  });

  const read = REQUIRED_READ_TYPES.map(type => {
    return {
      type: type,
      registerId: registerId,
      value: chance.natural({ min: READ_VALUE_MIN, max: READ_VALUE_MAX })
    };
  });

  const nowMs = new Date().getTime();
  const yearAgoMs = nowMs - 31536000000; // milliseconds in a year

  // Random date anywhere in the last year from now
  // note that it is a string since this is how it will be sent as JSON string
  const readDate = new Date(
    chance.natural({ min: yearAgoMs, max: nowMs })
  ).toISOString();

  return {
    body: { customerId, serialNumber, mpxn, read, readDate },
    headers: { idempotencyKey }
  };
};

module.exports = generateRandomReading;
