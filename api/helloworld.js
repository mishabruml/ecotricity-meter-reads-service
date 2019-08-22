const mongoose = require("mongoose");
const nameModel = require("../src/db/models/nameModel");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI);
    const { name = "world" } = req.query;
    await nameModel.create({ name });
    await mongoose.disconnect();
    res.status(200).send(`Hello ${name}!`);
  } catch (err) {
    console.error(err);
    await mongoose.disconnect();
    res.status(500).send("Server error");
  }
};
