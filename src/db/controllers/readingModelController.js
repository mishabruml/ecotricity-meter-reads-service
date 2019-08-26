// Controller for accessing ReadingModels collection
const ReadingModel = require("../models/readingModel");

module.exports = class ReadingModelController {
  constructor() {}

  getAllRecords = async () => {
    return await ReadingModel.find({}, { _id: false, __v: false })
      .sort({
        readDate: -1
      })
      .lean();
  };

  getOneByCustomerId = async customerId => {
    return await ReadingModel.findOne(customerId, {
      _id: false,
      __v: false
    })
      .sort({
        readDate: -1
      })
      .lean();
  };

  getAllByCustomerId = async customerId => {
    return await ReadingModel.find(customerId, {
      _id: false,
      __v: false
    })
      .sort({
        readDate: -1
      })
      .lean();
  };
};
