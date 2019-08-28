const ReadingModelController = require("../../src/db/controllers/readingModelController");

const { expect } = require("chai");

describe("ReadingModel db controller class", async () => {
  it("should be able to instantiate the class OK", () => {
    const readingModelController = new ReadingModelController();
    expect(readingModelController).to.be.an.instanceOf(ReadingModelController);
  });
});
