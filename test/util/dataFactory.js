const readingModel = require("../../src/db/models/readingModel");

const dataFactory = () => {
  const testCustomerId = 12345;
  const testReading = new readingModel({ customerId: testCustomerId });

  console.log(testReading);
};
