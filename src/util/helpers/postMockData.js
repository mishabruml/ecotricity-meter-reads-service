require("dotenv").config();
const post = require("../../../api/meter-read/post");
const generateRandomReading = require("../../../test/util/generateRandomReading");

const postMockData = async () => {
  const mockData = await generateRandomReading();
  const req = { body: mockData };
  const res = {
    status: code => {
      console.log(code);
    },
    send: () => {
      console.log("POST went OK!");
      console.log({ mockData });
    }
  };
  await post(req, res);
  return mockData;
};

postMockData();

// module.exports = postMockData;
