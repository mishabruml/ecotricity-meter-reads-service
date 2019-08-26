const { expect } = require("chai");
const ReadingModel = require("../src/db/models/readingModel");
const generateRandomReading = require("./testutilities/generateRandomReading");

describe("reading schema", () => {
  it("should successfully create an instance of the model with valid data", async () => {
    const randomReadingData = generateRandomReading();
    const reading = new ReadingModel(randomReadingData);
    await reading.validate();
  });

  it("should fail validation when no customerId is specified", async () => {
    const randomReadingData = generateRandomReading();
    randomReadingData.customerId = null;
    const reading = new ReadingModel(randomReadingData);
    reading.validate(err => {
      expect(err.name).to.eql("ValidationError");
      expect(err.errors.customerId.path).to.eql("customerId");
    });
  });

  it("should fail schema validation when any required field is omitted on document creation", async () => {
    const randomReadingData = generateRandomReading();

    // try the validation for each field = null
    const fields = Object.keys(randomReadingData);
    fields.forEach(field => {
      const data = generateRandomReading();
      data[field] = null;
      const reading = new ReadingModel(data);
      reading.validate(err => {
        expect(err.name).to.eql("ValidationError");
        expect(err.errors[field].path).to.eql(field);
        expect(err.errors[field].kind).to.eql("required");
      });
    });
  });

  it("should fail schema validation when invalid data-type is entered for customerId", async () => {
    const randomReadingData = generateRandomReading();
    randomReadingData.customerId = { a: 1, b: 2 }; // will not cast, forcing error
    const reading = new ReadingModel(randomReadingData);
    reading.validate(err => {
      expect(err.name).to.eql("ValidationError");
      expect(err.errors.customerId.path).to.eql("customerId");
      expect(err.errors.customerId.kind).to.eql("String");
    });
  });

  it("should fail schema validation when 'read type' is not one of 'DAY' or 'ANYTIME'", async () => {
    const randomReadingData = generateRandomReading();
    const INVALID_TYPE_STRING = "kja-;//sdj$$b182££3887yjsndhb";
    randomReadingData.read[0].type = INVALID_TYPE_STRING;
    const reading = new ReadingModel(randomReadingData);
    reading.validate(err => {
      expect(err.name).to.eql("ValidationError");
      const errors = err.errors["read.0.type"];
      expect(errors.path).to.eql("type");
      expect(errors.kind).to.eql("enum");
      expect(errors.value).to.eql(INVALID_TYPE_STRING);
    });
  });
});
