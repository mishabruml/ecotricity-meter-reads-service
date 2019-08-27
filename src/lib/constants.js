// Constants, mostly for request and data validation, and keep data consistent

const CUSTOMER_ID_UUID_VERSION = 4;
const SERIAL_NUMBER_LENGTH = 11;
const MPXN_LENGTH = 8;
const REQUIRED_READ_TYPES = ["ANYTIME", "NIGHT"]; // nb this will sadly force ordering in body of post request
const REGISTER_ID_LENGTH = 6;
const READ_VALUE_MIN = 0;
const READ_VALUE_MAX = 9999;
const POST_BODY_REQUIRED_FIELDS = [
  "customerId",
  "serialNumber",
  "mpxn",
  "read",
  "readDate"
];
const GET_QUERY_ALLOWED_STRINGS = [
  "customerId",
  "serialNumber",
  "mpxn",
  "readDate"
];

module.exports = {
  CUSTOMER_ID_UUID_VERSION,
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REQUIRED_READ_TYPES,
  REGISTER_ID_LENGTH,
  READ_VALUE_MIN,
  READ_VALUE_MAX,
  POST_BODY_REQUIRED_FIELDS,
  GET_QUERY_ALLOWED_STRINGS
};
