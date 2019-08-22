module.exports = async (req, res) => {
  console.log(req.method);
  console.log(req.body);
  res.send("posted reading ok");
};
