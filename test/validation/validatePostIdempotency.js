const validatePostIdempotency = require("../../src/util/validation/validatePostIdempotency");
const { ValidationError, IdempotencyError } = require("../../src/lib/errors");
const ReadingModelController = require("../../src/db/controllers/readingModelController");

const chai = require("chai");
chai.use(require("chai-shallow-deep-equal"));
const { expect } = chai;

const Chance = require("chance");
const chance = new Chance();

const sinon = require("sinon");
const sandbox = sinon.createSandbox();

describe("POST /reading idempotencyKey validation", () => {
  it("should throw a validation error if idempotencyKey is not a string", async () => {
    const idempotencyKey = chance.integer({ min: 100, max: 1000 }); // generate a random number

    try {
      await validatePostIdempotency(idempotencyKey);
    } catch (e) {
      expect(e)
        .to.be.an.instanceOf(ValidationError)
        .with.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            keyword: "type",
            message: "should be string"
          }
        ]);
    }
  });

  it("should throw a validation error if idempotencyKey is not a uuid string", async () => {
    const idempotencyKey = chance.string({ alpha: true });

    try {
      await validatePostIdempotency(idempotencyKey);
    } catch (e) {
      expect(e)
        .to.be.an.instanceOf(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            keyword: "format",
            params: { format: "uuid" }
          }
        ]);
    }
  });

  it("should throw a idempotency error if idempotencyKey already exists", async () => {
    // generate a random key
    const idempotencyKey = chance.guid();

    // stub the db controller to return the random key, as if it already existed in db
    sandbox
      .stub(ReadingModelController.prototype, "getAllByIdempotencyKey")
      .returns([{ idempotencyKey, _id: "fake_mongo_id" }]);

    try {
      await validatePostIdempotency(idempotencyKey);
    } catch (e) {
      expect(e)
        .to.be.an.instanceOf(IdempotencyError)
        .with.property("idempotencyKey", idempotencyKey);
    }
  });

  after(() => {
    sandbox.restore();
  });
});
