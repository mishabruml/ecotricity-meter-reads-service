const mongoose = require("mongoose");

const validateGetQuerystrings = require("../../src/validation/get/validateGetQuerystrings");
const ReadingModelController = require("../../src/db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

const { QuerystringError } = require("../../src/lib/errors");
const { GET_QUERY_ALLOWED_STRINGS } = require("../../src/lib/constants");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    console.log({ query: req.query });

    validateGetQuerystrings(req.query);

    // const noQueries = Object.keys(req.query).length === 0;

    // if (noQueries) {
    //   console.log("no querystrings");
    //   result = await readingModelController.getAllRecords();
    // }

    const { customerId, serialNumber, mpxn, readDate } = req.query;

    result = await readingModelController.dynamicGETquery(
      customerId,
      serialNumber,
      mpxn,
      readDate
    );

    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    if (err instanceof QuerystringError) {
      res
        .status(400)
        .send(
          `${err.name}: ${err.message}. Allowed query parameters: ${GET_QUERY_ALLOWED_STRINGS}`
        );
    } else res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
