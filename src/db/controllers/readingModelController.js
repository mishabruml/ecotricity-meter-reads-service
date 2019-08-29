// Controller for accessing ReadingModels collection
const ReadingModel = require("../models/readingModel");

module.exports = class ReadingModelController {
  constructor() {
    this.projectionSettings = { _id: false, __v: false, idempotencyKey: false };
    this.sortBySettings = { readDate: -1 };
  }

  async getAllRecords() {
    return await ReadingModel.find({}, this.projectionSettings)
      .sort(this.sortBySettings)
      .lean();
  }

  async getAllByIdempotencyKey(idempotencyKey) {
    return await ReadingModel.find(
      { idempotencyKey },
      { idempotencyKey: true, _id: true } // only need to project idempotencyKey and doc _id
    )
      .sort({
        createdAt: -1 // sort by createdAt, since it's likely the offending doc will be recently created
      })
      .lean();
  }

  async getExactMatches(data) {
    return await ReadingModel.find(data, this.projectionSettings)
      .sort(this.sortBySettings)
      .lean();
  }

  // get a single reading by customerId- the sortBy will affect which result is returned
  async getOneByCustomerId(customerId) {
    return await ReadingModel.findOne({ customerId }, this.sortBySettings)
      .sort(this.sortBySettings)
      .lean();
  }

  // get every reading for a single customerId; sortBy will affect returned order
  async getAllByCustomerId(customerId) {
    return await ReadingModel.find({ customerId }, this.projectionSettings)
      .sort(this.sortBySettings)
      .lean();
  }

  // find readings by queryObject, provided by querystring parameters to GET request
  async queryDbWithQueryObject(query) {
    return await ReadingModel.find(query, this.projectionSettings)
      .sort(this.sortBySettings)
      .lean();
  }

  async insertReading(data) {
    return await ReadingModel.create(data);
  }
};
