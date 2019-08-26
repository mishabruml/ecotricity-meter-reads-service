const mongoose = require("mongoose");
const ReadingModel = require("../../src/db/models/readingModel");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    console.log({ method: req.method });
    console.log({ query: req.query });
    const { customerId } = req.query;

    const result = await ReadingModel.findOne(
      { customerId },
      { _id: false, __v: false } // don't project these fields - automatically populated by mongodb
    ).lean();

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
