const mongoose = require("mongoose");
const validatePostBody = require("../../src/util/validation/validatePostBody");
const validatePostIdempotency = require("../../src/util/validation/validatePostIdempotency");
const {
  DataParameterError,
  InvalidDataError,
  IdempotencyError,
  ValidationError
} = require("../../src/lib/errors");

const ReadingModel = require("../../src/db/models/readingModel");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    const { body } = req;
    const idempotencyKey = req.headers["idempotency-key"];

    // ensure the POST is idempotent
    const idempotentRequest = await validatePostIdempotency(idempotencyKey);

    // Validate the body data JSON
    const validBodyData = validatePostBody(body);

    if (idempotentRequest && validBodyData) {
      // combine the body and idempotency key into a single object
      const reading = body;
      reading.idempotencyKey = idempotencyKey;

      // create reading entry in db from object
      const entry = await ReadingModel.create(reading);
      res.status(201);
      res.send(entry);
    }
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid JSON") {
      res.status(400).send(err.message);
    } else if (err instanceof IdempotencyError) {
      res
        .status(409)
        .send(`${err.name}: ${err.message}. ${err.idempotencyKey}`);
    } else if (err instanceof ValidationError) {
      res.status(400).send(`${err.name}: ${err.message}`);
    } else {
      res.status(500).send(`Server error. ${err.message || ""}`);
    }
  } finally {
    await mongoose.disconnect();
  }
};
