const mongoose = require("mongoose");

const validateGetQuerystrings = require("../../src/validation/get/validateGetQuerystrings");
const ReadingModelController = require("../../src/db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

const { QuerystringError } = require("../../src/lib/errors");
const { GET_QUERY_ALLOWED_STRINGS } = require("../../src/lib/constants");

const get = async (req, res) => {
  try {
    const { query } = req;

    // validate the querystring object
    await validateGetQuerystrings(query);

    // get the readings fromt he db
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    const results = await readingModelController.queryDbWithQueryObject(query);

    // return results to client
    if (results.length) res.send(results);
    // handle 'no results' case
    else
      res
        .status(404)
        .send(`No reading(s) found for query ${JSON.stringify(query)}`);
  } catch (err) {
    console.error(err);

    // Handle an invalid querystring
    if (err instanceof QuerystringError) {
      res
        .status(400)
        .send(
          `${err.name}: ${err.message}. Allowed query parameters: ${GET_QUERY_ALLOWED_STRINGS}`
        );
    } else {
      // Handle any other errors
      res.status(500).send(`Server error: ${err.message || ""}`);
    }
  } finally {
    // always disconnect from db
    await mongoose.disconnect();
  }
};

module.exports = get;
