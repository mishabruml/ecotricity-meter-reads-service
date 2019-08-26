const { InvalidDataError, ValidationError } = require("../src/lib/errors");
const { expect } = require("chai");
describe("custom error classes", () => {
  it("should throw a ValidationError OK", () => {
    const throwValidationError = () => {
      throw new ValidationError("whoops", (ajvErrors = ["error1", "error2"]));
    };

    expect(() => {
      throwValidationError();
    }).throw(ValidationError);
  });
});
