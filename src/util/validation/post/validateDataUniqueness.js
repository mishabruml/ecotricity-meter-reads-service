const { DuplicateError } = require("../../../lib/errors");
const ReadingModelController = require("../../../db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

const validateDataUniqueness = async data => {
  const existingRecords = await readingModelController.getExactMatches(data);
  if (existingRecords.length) throw new DuplicateError(data);
  return true;
};

module.exports = validateDataUniqueness;
