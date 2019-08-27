const validateGetQueryStrings = require("../../../src/validation/get/validateGetQuerystrings");
const { QuerystringError } = require("../../../src/lib/errors");
const generateRandomReading = require("../../util/generateRandomReading");
const { GET_QUERY_ALLOWED_STRINGS } = require("../../../src/lib/constants");

const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-shallow-deep-equal"));

const Chance = require("chance");
const chance = new Chance();

describe("GET /reading querystring validation", () => {
  it("should accept an empty querystring object", () => {
    const valid = validateGetQueryStrings({});
    expect(valid).true;
  });

  it("should accept a set of any, and all, possible valid querystrings together", () => {
    // generate random dataset - can be used as queries
    const mockData = generateRandomReading();

    let query = {};

    // map allowed queryStrings with values from random data to query object
    GET_QUERY_ALLOWED_STRINGS.forEach(queryString => {
      query[queryString] = mockData.body[queryString];
      // by putting the call to validation inside the loop, the queryObject is checked each time as it is built
      const valid = validateGetQueryStrings(query);
      expect(valid).true;
    });
  });

  it("should throw an error for any queryString that is not a string type", () => {
    // try for each allowed querystring
    GET_QUERY_ALLOWED_STRINGS.forEach(queryString => {
      // create random value and assign it to the current queryString parameter
      const randomValue = chance.integer();
      const query = {};
      query[queryString] = randomValue;

      expect(() => {
        validateGetQueryStrings(query);
      })
        .to.throw(QuerystringError)
        .with.property("ajvErrors")
        .which.does.shallowDeepEqual([
          {
            keyword: "type",
            dataPath: `.${queryString}`,
            params: { type: "string" }
          }
        ]);
    });
  });

  it("should throw an error when a disallowed querystring is encountered", () => {
    const query = {};

    // generate a random querystring parameter name and check it isn't by chance one of our allowed strings
    const randomKey = chance.string();
    expect(GET_QUERY_ALLOWED_STRINGS).to.not.include(randomKey);

    // generate a random value for our querystring parameter
    const randomValue = chance.integer();

    // populate query object with the noise
    query[randomKey] = randomValue;

    expect(() => {
      validateGetQueryStrings(query);
    })
      .to.throw(QuerystringError)
      .which.has.property("ajvErrors")
      .which.does.shallowDeepEqual([
        {
          keyword: "additionalProperties",
          params: { additionalProperty: randomKey }
        }
      ]);
  });
});
