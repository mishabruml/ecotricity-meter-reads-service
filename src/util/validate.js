const { MissingParameterError } = require("../lib/errors");
const { InvalidDataError } = require("../lib/errors");
const { expect } = require("chai");
const validator = require("validator");
const validatePost = body => {
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
    // grab any missing parameters by diffing actual:expected arrays from the chai error, and throw custom error
    const missingParams = e.expected.filter(x => !e.actual.includes(x)).join();
    throw new MissingParameterError(missingParams);
  }

  const { customerId, serialNumber, mpxn, read, readDate } = body;

  if (!validator.isUUID(customerId, 4))
    throw new InvalidDataError("customerId must be uuidv4");

  if (!validator.isAlphanumeric(serialNumber) || serialNumber.length !== 11)
    throw new InvalidDataError(
      "serialNumber must be 11-characater alphanumeric"
    );

  if (!validator.isNumeric(mpxn) || mpxn.length !== 8)
    throw new InvalidDataError("mpxn must be a 8-character number");

  if (!Array.isArray(read))
    throw new InvalidDataError("read must be an object array");

  if (read.length !== 2) throw new InvalidDataError("read must have 2 entries");

  console.log(
    read.sort(function(a, b) {
      var textA = a.type.toUpperCase();
      var textB = b.type.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    })
  );
};

module.exports = validatePost;
