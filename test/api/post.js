const mongoose = require("mongoose");
const post = require("../../api/meter-read/post");

const ReadingModelController = require("../../src/db/controllers/readingModelController");

const generateRandomReading = require("../util/generateRandomReading");

const { expect } = require("chai");

const sinon = require("sinon");
const sandbox = sinon.createSandbox();
require("sinon-mongoose");

describe("POST /meter-reading", async () => {
  it("should post a valid meter reading", async () => {
    // create some seed data
    const req = generateRandomReading();
    const reading = req.body;

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
