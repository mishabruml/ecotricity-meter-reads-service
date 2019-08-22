const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    console.log(req.method);
    console.log(req.body);
    res.send("posted reading ok");
  } catch (e) {
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
