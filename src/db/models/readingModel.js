const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

// "sub" schema for the reads sub-document
const readSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["NIGHT", "ANYTIME"] },
    registerId: { type: String, required: true },
    value: { type: Number, require: true }
  },
  { _id: false } // don't need id for the subdoc
);

// Main schema
const readingSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  serialNumber: { type: Number, required: true },
  mpxn: { type: String, required: true },
  read: { type: [readSchema], required: true },
  readDate: { type: Date, required: true }
});

module.exports = mongoose.model("readings", readingSchema); // export as model
