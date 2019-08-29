const mongoose = require("mongoose");
const post = require("../../api/meter-read/post");

const ReadingModelController = require("../../src/db/controllers/readingModelController");

const generateRandomReading = require("../util/generateRandomReading");

const { expect } = require("chai");

const sinon = require("sinon");
const sandbox = sinon.createSandbox();
require("sinon-mongoose");
const Chance = require("chance");
const chance = new Chance();

describe("POST /meter-reading", async () => {
  it("should post a valid meter reading", async () => {
    // create some seed data
    const req = generateRandomReading();
    const existingIdempotencyKey = "fake_mongo_id";
    const existingDoc_id = chance.guid();

    const reading = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    // const expectedDbEntry = reading;
    // expectedDbEntry.idempotencyKey = idempotencyKey;
    // expectedDbEntry._id = chance.guid();

    //Mock the db connection
    const connectMock = sinon.mock(mongoose);
    connectMock.expects("connect");

    // stub the db controller to return nothing (key is not in db)
    sandbox
      .stub(ReadingModelController.prototype, "getAllByIdempotencyKey")
      .returns([]);

    // stub the db controller to return no exact matches - unique request
    sandbox
      .stub(ReadingModelController.prototype, "getExactMatches")
      .returns([]);

    // stub the db controller to insert the reading into db
    sandbox
      .stub(ReadingModelController.prototype, "insertReading")
      .withArgs(reading)
      .returns(reading);

    let responseCode;
    let responseBody;

    // simulate the res methods
    const res = {
      status: code => {
        responseCode = code;
      },
      send: response => {
        responseBody = response;
      }
    };

    // try the post
    await post(req, res);

    // assert the response is as expected
    expect(responseCode).to.eql(201);
    expect(responseBody).to.eql(reading);

    connectMock.restore();
    sandbox.restore();
  });
});
