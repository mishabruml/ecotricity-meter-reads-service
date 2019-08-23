const uuidv4 = require("uuid");
const Chance = require("chance");
const chance = new Chance();

const generateRandomReading = () => {
  const customerId = uuidv4();
  const serialNumber = chance.string({ length: 11, numeric: true });
  const mpxn = chance.string({ length: 8, numeric: true });
  const registerId = chance.string({ length: 6, numeric: true });
  const read = [
    {
      type: "ANYTIME",
      registerId: registerId,
      value: chance.natural({ min: 1, max: 9999 })
    },
    {
      type: "NIGHT",
      registerId: registerId,
      value: chance.natural({ min: 1, max: 9999 })
    }
  ];
  const nowMs = new Date().getTime();
  const yearAgoMs = nowMs - 31536000000;

  const readDate = new Date(chance.natural({ min: yearAgoMs, max: nowMs })); // Random date anywhere in the last year from now

  return { customerId, serialNumber, mpxn, read, readDate };
};

module.exports = generateRandomReading;
