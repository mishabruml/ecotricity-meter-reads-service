const mongoose = require("mongoose");
const ReadingModel = require("../../src/db/models/readingModel");
const ReadingModelController = require("../../src/db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    console.log({ query: req.query });

    let result;

    const noQueries = Object.keys(req.query).length === 0;

    if (noQueries) {
      console.log("no querystrings");
      result = await readingModelController.getAllRecords();
    }

    const { customerId, serialNumber, mpxn } = req.query;

    console.log(customerId, serialNumber, mpxn);

    // result = await readingModelController.getOneByCustomerId(customerId);

    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
