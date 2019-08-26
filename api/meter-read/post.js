const mongoose = require("mongoose");
const validatePostBody = require("../../src/util/validation/validatePostBody");
const {
  DataParameterError,
  InvalidDataError
} = require("../../src/lib/errors");

const ReadingModel = require("../../src/db/models/readingModel");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    const { body } = req;

    // Validate the body data JSON
    const validBodyData = validatePostBody(body);

    if (validBodyData) {
      // create reading entry in db
      const entry = await ReadingModel.create(body);
      res.status(201).send(entry);
    }
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid JSON") res.status(400).send("Invalid JSON");
    if (err instanceof DataParameterError)
      res.status(400).send(`Problem with data: ${err.message || ""}`);
    if (err instanceof InvalidDataError)
      res.status(400).send(`Data invalid: ${err.message || ""}`);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
