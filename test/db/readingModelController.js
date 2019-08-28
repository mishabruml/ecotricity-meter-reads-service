const ReadingModelController = require("../../src/db/controllers/readingModelController");
const ReadingModel = require("../../src/db/models/readingModel");

const { expect } = require("chai");

const sinon = require("sinon");
require("sinon-mongoose");
const Chance = require("chance");
const chance = new Chance();

describe.only("ReadingModel db controller class", async () => {
  let readingModelController;

  beforeEach("instantiate the class", () => {
    readingModelController = new ReadingModelController();
    expect(readingModelController).to.be.an.instanceOf(ReadingModelController);
  });

  afterEach("restore the stubs", () => {
    sinon.restore();
  });

  it("should get a record from the db by idempotencyKey", async () => {
    // create some seed data
    const idempotencyKey = chance.guid();
    const _id = "fake_mongo_id";

    // Mock (stub) the model native find command to return the seed data
    const findMock = sinon
      .mock(ReadingModel)
      .expects("find")
      .withArgs({ idempotencyKey }, { idempotencyKey: true, _id: true })
      .chain("sort")
      .withArgs({ createdAt: -1 })
      .chain("lean")
      .resolves({ idempotencyKey, _id });

    // call the controller methods with the mocked 'find'
    const result = await readingModelController.getAllByIdempotencyKey(
      idempotencyKey
    );

    expect(result).to.deep.eql({ idempotencyKey, _id });

    findMock.restore();
  });
});
