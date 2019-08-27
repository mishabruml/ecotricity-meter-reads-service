const {
  ValidationError,
  IdempotencyError,
  DuplicateError
} = require("../src/lib/errors");

const { expect } = require("chai");

describe("ValidationError class", () => {
  it("should be able to throw a ValidationError with ajvErrors", () => {
    const mockAjvErrors = ["ajvError1", "ajvError2"];
    const throwValidationError = () => {
      throw new ValidationError("whoops", (ajvErrors = mockAjvErrors));
    };

    expect(() => {
      throwValidationError();
    })
      .throw(ValidationError)
      .that.has.property("ajvErrors")
      .eql(mockAjvErrors);
  });
});

describe("IdempotencyError class", () => {
  it("should be able to throw a IdempotencyError with idempotency-string constructor arg", () => {
    const mockIdempotencyKey = "idempotencyKey123";
    const throwValidationError = () => {
      throw new IdempotencyError(mockIdempotencyKey);
    };

    expect(() => {
      throwValidationError();
    })
      .throw(IdempotencyError)
      .that.has.property("idempotencyKey")
      .eql(mockIdempotencyKey);
  });
});

describe("DuplicateError class", () => {
  it("should be able to throw a DuplicateError with body/data constructor arg", () => {
    const mockBody = { key1: "value1", key2: "value2" };
    const throwValidationError = () => {
      throw new DuplicateError(mockBody);
    };

    expect(() => {
      throwValidationError();
    })
      .throw(DuplicateError)
      .that.has.property("body")
      .eql(mockBody);
  });
});
