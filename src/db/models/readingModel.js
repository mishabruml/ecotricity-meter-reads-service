const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  customerId: { type: String, required: true }
});

module.exports = mongoose.model("readings", readingSchema);
