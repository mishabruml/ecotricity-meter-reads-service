const { DuplicateError } = require("../../lib/errors");
const ReadingModelController = require("../../db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

const validateDataUniqueness = async body => {
  const existingRecords = await readingModelController.getExactMatches(body);
  if (existingRecords.length) throw new DuplicateError(body);
  return true;
};

module.exports = validateDataUniqueness;
