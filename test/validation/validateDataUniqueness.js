const validateDataUniqueness = require("../../src/util/validation/validateDataUniqueness");
const { DuplicateError } = require("../../src/lib/errors");
const ReadingModelController = require("../../src/db/controllers/readingModelController");
const generateRandomReading = require("../util/generateRandomReading");

const chai = require("chai");
chai.use(require("chai-shallow-deep-equal"));
const { expect } = chai;

const sinon = require("sinon");
const sandbox = sinon.createSandbox();

describe("POST /reading data uniqueness validation", () => {
  it("should accept unique data", async () => {
    // create a fake reading body
    const { body } = generateRandomReading();

    // stub the db controller to return no exact matches
    sandbox
      .stub(ReadingModelController.prototype, "getExactMatches")
      .returns([]); // return empty array
    const valid = await validateDataUniqueness(body);
    expect(valid).true;
  });

  it("should throw an error for non-unique data", async () => {
    // create a fake reading body
    const { body } = generateRandomReading();

    // stub the db controller to return the random data a few times
    sandbox
      .stub(ReadingModelController.prototype, "getExactMatches")
      .returns([body, body]);

    try {
      await validateDataUniqueness(body);
    } catch (e) {
      expect(e)
        .to.be.an.instanceOf(DuplicateError)
        .with.property("body", body);
    }
  });

  afterEach(() => {
    sandbox.restore();
  });
});
