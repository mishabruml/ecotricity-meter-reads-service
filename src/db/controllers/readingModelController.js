// Controller for accessing ReadingModels collection
const ReadingModel = require("../models/readingModel");

module.exports = class ReadingModelController {
  constructor() {}

  getOneByCustomerId = async customerId => {
    const results = await ReadingModel.findOne(customerId);
    return results;
  };

  getAllByCustomerId = async customerId => {
    const results = await ReadingModel.find(customerId);
    return results;
  };
};
