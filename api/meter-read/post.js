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

    // destructure body into the data we need
    const { customerId, serialNumber, mpxn, read, readDate } = body;
    res.send("posted reading ok");
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
