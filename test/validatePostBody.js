const validatePostBody = require("../src/util/validation/validatePostBody");
const postBodySchema = require("../src/util/validation/postBodySchema");
const generateRandomReading = require("./testutilities/generateRandomReading");
const { DataParameterError, ValidationError } = require("../src/lib/errors");

const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-shallow-deep-equal"));

describe("POST /reading data validation", () => {
  it("should accept a valid POST body", () => {
    const body = generateRandomReading();
    const valid = validatePostBody(body);
    expect(valid).to.be.true;
  });

  it("should throw an error if body is null", () => {
    const body = null;
    expect(() => {
      validatePostBody(body);
    }).to.throw(ValidationError, "data should be object");
  });

  it("should throw an error if body is empty object", () => {
    const body = {};
    const requiredProperties = postBodySchema.required;
    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .with.length(requiredProperties.length); // one ajv error per missing 'required' field
  });

  it("should throw an error if any required field is missing", () => {
    // for each required field
    postBodySchema.required.forEach(field => {
      const body = generateRandomReading();
      delete body[field]; // delete each required field in turn
      expect(() => {
        validatePostBody(body);
      })
        .to.throw(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          { keyword: "required", params: { missingProperty: field } }
        ]);
    });
  });
});
