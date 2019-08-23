const mongoose = require("mongoose");
const validatePostBody = require("../../src/util/validatePostBody");
const {
  MissingParameterError,
  InvalidDataError
} = require("../../src/lib/errors");

const ReadingModel = require("../../src/db/models/readingModel");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    let body;
    try {
      body = req.body;
    } catch (e) {
      throw new MissingParameterError("body");
    }
    validatePostBody(body);
    res.send("posted reading ok");
  } catch (err) {
    console.error(err);
    if (err instanceof MissingParameterError)
      res.status(400).send(`Missing parameter(s): ${err.message || ""}`);
    if (err instanceof InvalidDataError)
      res.status(400).send(`Data invalid: ${err.message || ""}`);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
