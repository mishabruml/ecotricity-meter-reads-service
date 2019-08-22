const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  serialNumber: { type: Number, required: true },
  mpxn: { type: String, required: true },
  read: [
    {
      // prettier-ignore
      "type": {type:String, enum: ["NIGHT", "ANYTIME"]}, // 'type' is a keyword in mongoose, that's why this looks wierd
      registerId: String,
      value: Number
    }
  ],
  readDate: { type: Date, required: true }
});

module.exports = mongoose.model("readings", readingSchema);
