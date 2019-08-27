// Controller for accessing ReadingModels collection
const ReadingModel = require("../models/readingModel");

module.exports = class ReadingModelController {
  constructor() {}

  async getAllRecords() {
    return await ReadingModel.find({}, { _id: false, __v: false })
      .sort({
        readDate: -1
      })
      .lean();
  }

  async getOneByCustomerId(customerId) {
    return await ReadingModel.findOne(
      { customerId },
      {
        _id: false,
        __v: false
      }
    )
      .sort({
        readDate: -1
      })
      .lean();
  }

  async getAllByCustomerId(customerId) {
    return await ReadingModel.find(
      { customerId },
      {
        _id: false,
        __v: false
      }
    )
      .sort({
        readDate: -1
      })
      .lean();
  }
};
