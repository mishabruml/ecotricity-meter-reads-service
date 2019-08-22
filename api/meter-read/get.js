module.exports = async (req, res) => {
  console.log(req.method);
  console.log(req.query);
  res.send("got reading ok");
};
