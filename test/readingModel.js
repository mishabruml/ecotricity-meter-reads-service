const { expect } = require("chai");
const ReadingModel = require("../src/db/models/ReadingModel");
const generateRandomReading = require("./util/generateRandomReading");

describe("reading schema", () => {
  it("should fail validation when no customerId is specified", async () => {
    const reading = new ReadingModel();
    reading.validate(err => {
      expect(err.name).to.eql("ValidationError");
      expect(err.errors.customerId.path).to.eql("customerId");
    });
  });

  it("should create an instance of the model with valid data", async () => {
    const randomReadingData = generateRandomReading();

    const reading = new ReadingModel(randomReadingData);

    await reading.validate();
    console.log(reading);
  });
});
