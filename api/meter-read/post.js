const mongoose = require("mongoose");
const validatePostBody = require("../../src/validation/post/validatePostBody");
const validatePostIdempotency = require("../../src/validation/post/validatePostIdempotency");
const validateDataUniqueness = require("../../src/validation/post/validateDataUniqueness");
const readingModelController = new (require("../../src/db/controllers/readingModelController"))();

const {
  ValidationError,
  DuplicateError,
  IdempotencyError
} = require("../../src/lib/errors");

const ReadingModel = require("../../src/db/models/readingModel");

const post = async (req, res) => {
  try {
    const { body } = req;
    const idempotencyKey = req.headers["idempotency-key"];

    // create reading entry in db from object
    await mongoose.connect(process.env.PROD_DB_URI, {
      useNewUrlParser: true
    });

    // ensure the POST is idempotent
    const idempotentRequest = await validatePostIdempotency(idempotencyKey);

    // Validate the body data JSON
    const validBodyData = await validatePostBody(body);

    const uniqueRequestData = await validateDataUniqueness(body);

    if (idempotentRequest && validBodyData && uniqueRequestData) {
      // combine the body and idempotency key into the single reading object
      const reading = body;
      reading.idempotencyKey = idempotencyKey;

      const entry = await readingModelController.insertReading(reading);
      // const entry = await ReadingModel.create(reading);
      res.status(201);
      res.send(entry);
    }
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid JSON") {
      res.status(400).send(err.message);
    } else if (err instanceof IdempotencyError) {
      res.status(409).send(`${err.name}: ${err.message} ${err.idempotencyKey}`);
    } else if (err instanceof ValidationError) {
      res.status(400).send(`${err.name}: ${err.message}`);
    } else if (err instanceof DuplicateError) {
      res
        .status(409)
        .send(`${err.name}: ${err.message} ${JSON.stringify(err.body)}`);
    } else {
      res.status(500).send(`Server error. ${err.message || ""}`);
    }
  } finally {
    await mongoose.disconnect();
  }
};

module.exports = post;
