const post = require("../../api/meter-read/post");
const generateRandomReading = require("./generateRandomReading");

const postMockData = async () => {
  const mockData = generateRandomReading();
  await post(mockData);
  return mockData;
};
