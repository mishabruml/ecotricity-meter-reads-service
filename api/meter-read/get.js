const mongoose = require("mongoose");
const ReadingModel = require("../../src/db/models/readingModel");
const ReadingModelController = require("../../src/db/controllers/readingModelController");
const readingModelController = new ReadingModelController();

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    console.log({ method: req.method });
    console.log({ query: req.query });
    const { customerId } = req.query;

    let result;
    if (!customerId) result = await readingModelController.getAllRecords();
    else result = await readingModelController.getOneByCustomerId(customerId);

    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
