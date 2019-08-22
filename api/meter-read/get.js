const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.PROD_DB_URI, { useNewUrlParser: true });
    console.log(req.method);
    console.log(req.query);
    res.send("got reading ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    await mongoose.disconnect();
  }
};
