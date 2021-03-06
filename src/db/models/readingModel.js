const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const { REQUIRED_READ_TYPES } = require("../../lib/constants");

// "sub" schema for the reads sub-document
const readSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: REQUIRED_READ_TYPES },
    registerId: { type: String, required: true },
    value: { type: Number, require: true }
  },
  { _id: false } // don't need id for the subdoc
);

// Main schema
const readingSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true, index: true, unique: true },
    serialNumber: { type: String, required: true },
    mpxn: { type: String, required: true },
    read: { type: [readSchema], required: true },
    readDate: { type: Date, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } } // will automatically timestamp the mongo doc at time of creation
);

module.exports = mongoose.model("readings", readingSchema); // export as model
