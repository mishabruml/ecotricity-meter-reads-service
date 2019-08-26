const validatePostBody = require("../src/util/validation/validatePostBody");
const postBodySchema = require("../src/util/validation/postBodySchema");
const generateRandomReading = require("./testutilities/generateRandomReading");
const { DataParameterError, ValidationError } = require("../src/lib/errors");
const {
  SERIAL_NUMBER_LENGTH,
  MPXN_LENGTH,
  REGISTER_ID_LENGTH,
  REQUIRED_READ_TYPES,
  READ_VALUE_MIN,
  READ_VALUE_MAX
} = require("../src/lib/constants");

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

  it("should throw an error if read is missing any required readings", () => {
    // test for all null readings
    REQUIRED_READ_TYPES.forEach(readType => {
      const body = generateRandomReading();

      const index = body.read.findIndex(o => o.type === readType);
      body.read[index] = null;
      expect(() => {
        validatePostBody(body);
      }).to.throw(ValidationError, `data.read[${index}] should be object`);
    });

    // test for altogether missing readings
    const body = generateRandomReading();

    while (body.read.length !== 0) {
      body.read.pop();
      expect(() => {
        validatePostBody(body);
      }).to.throw(
        ValidationError,
        `data.read should NOT have fewer than ${REQUIRED_READ_TYPES.length} items`
      );
    }
  });

  it("should throw an error if more readings than permitted are encountered", () => {
    const body = generateRandomReading();

    // duplicate the last element of read array
    const lastElement = body.read[body.read.length - 1];
    body.read[body.read.length] = lastElement;

    expect(() => validatePostBody(body)).to.throw(
      ValidationError,
      `data.read should NOT have more than ${REQUIRED_READ_TYPES.length} items`
    );
  });

  it("should throw an error if any readings are missing any parameters", () => {
    // run test for each reading
    REQUIRED_READ_TYPES.forEach(readType => {
      const body = generateRandomReading();
      const reading = body.read.find(o => o.type === readType);

      // for each property of the reading
      Object.keys(reading).forEach(readingField => {
        delete reading[readingField];
        expect(() => {
          validatePostBody(body);
        }).to.throw(ValidationError);
      });
    });
  });

  it("should throw an error for disallowed reading types", () => {
    const body = generateRandomReading();
    const illegalReadType = chance.string(); // generate a random read type
    expect(REQUIRED_READ_TYPES.indexOf(illegalReadType)).to.equal(-1); // check we haven't randomly generated an allowed type...
    body.read[0].type = illegalReadType;

    expect(() => {
      validatePostBody(body);
    }).to.throw(
      ValidationError,
      "data.read[0].type should be equal to one of the allowed values"
    );
  });

  it("should throw an error if any reading's registerId is not an alphanumeric string or incorrect length", () => {
    // run test for each reading
    REQUIRED_READ_TYPES.forEach(readType => {
      let body = generateRandomReading();
      const reading = body.read.find(o => o.type === readType);
      const index = body.read.findIndex(o => o.type === readType);

      // try non-alphanumeric string
      reading.registerId = chance.string({
        symbols: true,
        length: REGISTER_ID_LENGTH
      });

      expect(() => {
        validatePostBody(body);
      }).to.throw(
        ValidationError,
        `data.read[${index}].registerId should match pattern "${postBodySchema.properties.read.items[0].properties.registerId.pattern}"`
      );

      // try 'too short' registerId
      reading.registerId = chance.string({
        alpha: true,
        numeric: true,
        length: REGISTER_ID_LENGTH - 1
      });

      expect(() => {
        validatePostBody(body);
      })
        .to.throw(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            keyword: "minLength",
            params: { limit: REGISTER_ID_LENGTH }
          }
        ]);

      // try 'too long' registerId
      reading.registerId = chance.string({
        alpha: true,
        numeric: true,
        length: REGISTER_ID_LENGTH + 1
      });

      expect(() => {
        validatePostBody(body);
      })
        .to.throw(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            keyword: "maxLength",
            params: { limit: REGISTER_ID_LENGTH }
          }
        ]);
    });
  });

  it("should throw an error if any reading's value is not a number, or is outwith the allowed limits", () => {
    // run test for each reading
    REQUIRED_READ_TYPES.forEach(readType => {
      let body = generateRandomReading();
      const reading = body.read.find(o => o.type === readType);
      const index = body.read.findIndex(o => o.type === readType);

      // set value as a random string (alpha-only just in case it's accidently parsed), but the type should be caught
      reading.value = chance.string({ alpha: true });
      expect(() => {
        validatePostBody(body);
      })
        .to.throw(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            keyword: "type",
            message: "should be number"
          }
        ]);

      // generate random value below minimum
      reading.value = chance.integer({ max: READ_VALUE_MIN });
      expect(() => {
        validatePostBody(body);
      })
        .to.throw(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            params: { limit: READ_VALUE_MIN },
            keyword: "minimum"
          }
        ]);

      // generate random value above maximum
      reading.value = chance.integer({ min: READ_VALUE_MAX });
      expect(() => {
        validatePostBody(body);
      })
        .to.throw(ValidationError)
        .that.has.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            params: { limit: READ_VALUE_MAX },
            keyword: "maximum"
          }
        ]);
    });
  });

  it("should throw an error if the readDate is not ISO datestring", () => {
    const body = generateRandomReading();

    // try readDate as an integer
    body.readDate = chance.integer();

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

    // try readDate as an integer
    body.readDate = chance.string({ alpha: true });

    expect(() => {
      validatePostBody(body);
    })
      .to.throw(ValidationError)
      .that.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "format",
          params: {
            format: "date-time"
          }
        }
      ]);
  });
});
