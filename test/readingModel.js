const { expect } = require("chai");
const ReadingModel = require("../src/db/models/readingModel");
const generateRandomReading = require("./util/generateRandomReading");

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

  it("should fail validation when no serialNumber is specified", async () => {
    const randomReadingData = generateRandomReading();
    randomReadingData.serialNumber = null;
    const reading = new ReadingModel(randomReadingData);
    reading.validate(err => {
      expect(err.name).to.eql("ValidationError");
      expect(err.errors.serialNumber.path).to.eql("serialNumber");
    });
  });
});
