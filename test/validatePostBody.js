const validatePostBody = require("../src/util/validation/validatePostBody");
const postBodySchema = require("../src/util/validation/postBodySchema");
const generateRandomReading = require("./testutilities/generateRandomReading");
const { DataParameterError, ValidationError } = require("../src/lib/errors");
const { SERIAL_NUMBER_LENGTH, MPXN_LENGTH } = require("../src/lib/constants");

const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-shallow-deep-equal"));

const Chance = require("chance");
const chance = new Chance();

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

  it("should throw an error if customerId is not a string", () => {
    const body = generateRandomReading();
    body.customerId = chance.integer({ min: 100, max: 1000 }); // generate a random number
    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        { keyword: "type", message: "should be string" }
      ]);
  });

  it("should throw an error if customerId is not a uuid string", () => {
    const body = generateRandomReading();
    body.customerId = chance.string({ alpha: true });
    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "format",
          params: {
            format: "uuid"
          }
        }
      ]);
  });

  it("should throw an error if serialNumber is not a string of digits only", () => {
    const body = generateRandomReading();

    // Test for non-string
    body.serialNumber = chance.integer({ min: 100, max: 1000 }); // generate a random number
    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "type",
          message: "should be string"
        }
      ]);

    // test for alpha-only string of the right length
    body.serialNumber = chance.string({
      alpha: true,
      length: SERIAL_NUMBER_LENGTH
    });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "pattern",
          params: { pattern: postBodySchema.properties.serialNumber.pattern }
        }
      ]);
  });

  it("should throw an error if serialNumber string is not the right number of characters", () => {
    const body = generateRandomReading();

    // generate a 'too short' serial number
    body.serialNumber = chance.string({
      numeric: true,
      length: SERIAL_NUMBER_LENGTH - 1
    });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "minLength",
          params: { limit: SERIAL_NUMBER_LENGTH }
        }
      ]);

    // generate a 'too long' serial number
    body.serialNumber = chance.string({
      numeric: true,
      length: SERIAL_NUMBER_LENGTH + 1
    });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "maxLength",
          params: { limit: SERIAL_NUMBER_LENGTH }
        }
      ]);
  });

  it("should throw an error if mpxn is not an alphanumeric string", () => {
    const body = generateRandomReading();

    // Test for symbols-only string
    body.mpxn = chance.integer({ min: 100, max: 1000 }); // generate a random number
    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "type",
          message: "should be string"
        }
      ]);

    // test for symobls-only string of the right length
    body.mpxn = chance.string({
      symbols: true,
      length: MPXN_LENGTH
    });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "pattern",
          params: { pattern: postBodySchema.properties.mpxn.pattern }
        }
      ]);
  });

  it("should throw an error if mpxn string is not the right number of characters", () => {
    const body = generateRandomReading();

    // generate a 'too short' mpxn
    body.mpxn = chance.string({
      numeric: true,
      length: MPXN_LENGTH - 1
    });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "minLength",
          params: { limit: MPXN_LENGTH }
        }
      ]);

    // generate a 'too long' mpxn
    body.mpxn = chance.string({
      numeric: true,
      length: MPXN_LENGTH + 1
    });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "maxLength",
          params: { limit: MPXN_LENGTH }
        }
      ]);
  });
});
