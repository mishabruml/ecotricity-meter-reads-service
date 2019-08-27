const { expect } = require("chai");
const ReadingModel = require("../src/db/models/readingModel");
const generateRandomReading = require("./util/generateRandomReading");
const { REQUIRED_READ_TYPES } = require("../src/lib/constants");
const Chance = require("chance");
const chance = new Chance();

describe("Reading mongoose schema validation", () => {
  it("should successfully create an instance of the model with valid data", async () => {
    const { body, headers } = generateRandomReading();
    const reading = body;
    reading.idempotencyKey = headers.idempotencyKey; // add the idempotency key
    const readingModel = new ReadingModel(reading);
    await readingModel.validate();
  });

  it("should fail validation when no customerId is specified", async () => {
    const { body, headers } = generateRandomReading();
    const reading = body;
    reading.idempotencyKey = headers.idempotencyKey; // add the idempotency key
    reading.customerId = null;
    const readingModel = new ReadingModel(reading);
    readingModel.validate(err => {
      expect(err.name).to.eql("ValidationError");
      expect(err.errors.customerId.path).to.eql("customerId");
    });
  });

  it("should fail schema validation when any required field is omitted on document creation", async () => {
    // extract all the fields we should test over
    const getfields = () => {
      const { body, headers } = generateRandomReading();
      const reading = body;
      reading.idempotencyKey = headers.idempotencyKey; // add the idempotency key
      return Object.keys(reading);
    };

    const fields = getfields();

    // try the validation for each field value = null in turn
    fields.forEach(field => {
      const { body, headers } = generateRandomReading();
      const reading = body;
      reading.idempotencyKey = headers.idempotencyKey; // add the idempotency key
      reading[field] = null;
      const readingModel = new ReadingModel(reading);
      readingModel.validate(err => {
        expect(err.name).to.eql("ValidationError");
        expect(err.errors[field].path).to.eql(field);
        expect(err.errors[field].kind).to.eql("required");
      });
    });
  });

  it("should fail schema validation when invalid data-type is entered for customerId", async () => {
    // set up random reading
    const { body, headers } = generateRandomReading();
    const reading = body;
    reading.idempotencyKey = headers.idempotencyKey; // add the idempotency key

    // set customerId
    reading.customerId = { a: 1, b: 2 }; // will not cast, forcing error
    const readingModel = new ReadingModel(reading);

    // try validation
    readingModel.validate(err => {
      expect(err.name).to.eql("ValidationError");
      expect(err.errors.customerId.path).to.eql("customerId");
      expect(err.errors.customerId.kind).to.eql("String");
    });
  });

  it("should fail schema validation when 'read type' is not one of 'DAY' or 'ANYTIME'", async () => {
    // set up random reading
    const { body, headers } = generateRandomReading();
    const reading = body;
    reading.idempotencyKey = headers.idempotencyKey; // add the idempotency key

    // set read type to something invalid
    const illegalReadType = chance.string(); // generate a random read type
    expect(REQUIRED_READ_TYPES.indexOf(illegalReadType)).to.equal(-1); // check we haven't randomly generated an allowed type...
    reading.read[0].type = illegalReadType;

    const readingModel = new ReadingModel(reading);
    readingModel.validate(err => {
      expect(err.name).to.eql("ValidationError");
      const errors = err.errors["read.0.type"];
      expect(errors.path).to.eql("type");
      expect(errors.kind).to.eql("enum");
      expect(errors.value).to.eql(illegalReadType);
    });
  });
});
