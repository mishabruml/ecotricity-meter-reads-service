const { ValidationError } = require("../src/lib/errors");
const { expect } = require("chai");
describe("ValidationError", () => {
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
