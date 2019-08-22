const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  serialNumber: { type: Number, required: true },
  mpxn: { type: String, required: true },
  read: [
    // sub-document schema
    new mongoose.Schema(
      { type: String, registerId: String, value: String },
      { _id: false, required: true }
    )
  ],

  readDate: { type: Date, required: true }
});

module.exports = mongoose.model("readings", readingSchema);
