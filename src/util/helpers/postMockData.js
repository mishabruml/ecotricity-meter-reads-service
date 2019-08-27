/* Helper function to generate a random (valid) POST request and send it to POST
endpoint which will actually create the resource on the db. The resource is
logged to the console, including mongo document _id which makes development,
testing and demos really easy and fun!
*/

require("dotenv").config(); // load the connection string into process.env when running locally
const post = require("../../../api/meter-read/post");
const generateRandomReading = require("../../../test/util/generateRandomReading");

const postMockData = async () => {
  const mockRequest = await generateRandomReading();

  // Mock the res functions for POST to call
  const res = {
    status: code => {
      console.log("POST response code: ", code);
    },
    send: result => {
      console.log("POST went OK!");
      console.log(result); // log the created resource to the console
    }
  };

  await post(mockRequest, res);
  return mockRequest;
};

postMockData();
