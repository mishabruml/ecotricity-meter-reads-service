const mongoose = require("mongoose");
const nameModel = require("../src/db/models/nameModel");

module.exports = async (req, res) => {
  console.log(process.env.PROD_DB_URI);
  await mongoose.connect(process.env.PROD_DB_URI);
  const { name = "world" } = req.query;

  await nameModel.create({ name });
  await mongoose.disconnect();
  res.status(200).send(`Hello ${name}!`);
};
