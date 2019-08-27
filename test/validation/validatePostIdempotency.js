// describe("POST /reading data validation: idempotencyKey header", () => {
//   it("should throw an error if idempotencyKey is not a string", () => {
//     const body = generateRandomReading();
//     body.idempotencyKey = chance.integer({ min: 100, max: 1000 }); // generate a random number
//     expect(() => {
//       validatePostBody(body);
//     })
//       .to.throw(ValidationError)
//       .that.has.property("ajvErrors")
//       .which.does.shallowDeepEqual([
//         {
//           keyword: "type",
//           message: "should be string",
//           dataPath: ".idempotencyKey"
//         }
//       ]);
//   });

//   it("should throw an error if idempotencyKey is not a uuid string", () => {
//     const body = generateRandomReading();
//     body.idempotencyKey = chance.string({ alpha: true });
//     expect(() => {
//       validatePostBody(body);
//     })
//       .to.throw(ValidationError)
//       .that.has.property("ajvErrors")
//       .which.does.shallowDeepEqual([
//         {
//           keyword: "format",
//           params: {
//             format: "uuid"
//           }
//         }
//       ]);
//   });
// });
