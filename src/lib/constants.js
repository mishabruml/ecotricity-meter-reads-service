// Constants for data validation
const CUSTOMER_ID_UUID_VERSION = 4;
const SERIAL_NUMBER_LENGTH = 11;
const MPXN_LENGTH = 8;
const REQUIRED_READ_TYPES = ["ANYTIME", "NIGHT"]; // nb this will force ordering in body of post request
const REGISTER_ID_LENGTH = 6;
const READ_VALUE_MIN = 0;
const READ_VALUE_MAX = 9999;

module.exports = {
  CUSTOMER_ID_UUID_VERSION,
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REQUIRED_READ_TYPES,
  REGISTER_ID_LENGTH,
  READ_VALUE_MIN,
  READ_VALUE_MAX
};
