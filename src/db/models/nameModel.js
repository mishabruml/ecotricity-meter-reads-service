const mongoose = require("mongoose");

const nameSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const nameModel = mongoose.model("names", nameSchema);

module.exports = nameModel;
