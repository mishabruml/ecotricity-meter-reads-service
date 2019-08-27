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

  async getAllByIdempotencyKey(idempotencyKey) {
    return await ReadingModel.find(
      { idempotencyKey },
      { idempotencyKey: true, _id: true } // only need to project idempotencyKey and doc _id
    )
      .sort({
        readDate: -1
      })
      .lean();
  }

  async getExactMatches(data) {
    return await ReadingModel.find(data, { _id: false, __v: false })
      .sort({ readDate: -1 })
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

  async dynamicGETquery(customerId, serialNumber, mpxn, readDate) {
    let query = ReadingModel.find();

    if (customerId) query.where({ customerId });
    if (serialNumber) query.where({ serialNumber });
    if (mpxn) query.where({ mpxn });
    if (readDate) query.where({ readDate });

    return await query.exec();
  }
};
