# ecotricity-meter-reads-service
Ecotricity meter reads service! An API to accept/present customer's electricity meter readings. 


## Notes

### Design ideas
- Clearly we need some kind of API that serves requests (GET, POST) at `/meter-read`
- Use node.js to write a RESTful API and mongodb for the persistence store- personally most experienced in this, will minimise time spent on set-up, can concentrate on business logic
- Consider express server deployed to AWS EC2/EBS with an express.js server, and possibly interfaced with API Gateway. 
  - Pros: enterprise/industry standard, secure, personal experience in this. Easy to deploy to lots of different platforms
  - Cons: Set-up time and hassle, will detract from focus on business logic. No new tech for me to learn!
- Consider serverless approach: Now framework. 
  - Pros: Minimum set-up, extremely fast to get up and running, free, have played with it before to set up simple node serverless env. Basically designed for rapid proof-of-concept/MVP cloud development. Seems easy and lightweight, can easily deploy to cloud for demo and run locally with Now as a dependecy. The actual logic/code could be easily portable to deploy using Serverless/AWS Lambda pattern, a typical enterprise setup which Ecotricity may well be using themselves.
  - Cons: Lack extensive experience with this stack. A bit 'left-field'
- Unit testing: need to isolate components and test those e.g. test the request validator, database getters and setters
  - Use a javascript testing framework, Mocha would do nicely
  - Create some 'data factories' with random generation libraries to seed the testing. Could also expose these tools (npm script?) to allow reviewers to easily generate mock data that is known to pass/fail, for hitting the hosted API with. 
- Code coverage: Use a code coverage module/framework. C8, nyc/istanbul. It would be a new thing for me, great opportunity to learn, and Ecotricity pride themselves on 100% coverage, so would be nice to reflect their standards in this demo. 
- Deployment: Now handles deployment very nicely straight out the box, CICD is basically built in, commits to master deploy to the production url, commits to any other branch get their own 'staging' url. Painless! 
- CICD: Use circleCI, experienced in this. Now will handle the deployments, but circlci can sit in front of Now deployments https://zeit.co/docs/v2/advanced/now-for-github#extending-your-github-workflow this means the unit test suite and code coverage can sit in the CI pipeline ahead of the Now CD using github deployment/status checks. Can probably even get a code coverage badge for the github repo :D
- Global uniqueness of the customerId - use uuidv4, consistent with mongodb indexing

### Initial queries
- Should the system accept multiple readings for a single customerId? Would this update the reading (arguably a PUT request) or create a new db entry for the read, same customerId and meter meta-data, different date and values. If yes, then customerId cannot be used to index the database (not unique). Also this would add further complexity; find previous entry, validate the incoming date is later, validate the meter read values have increased, so on. For an MVP, allowing 1 reading per customerId would make things a lot simpler. However, designing a system where customerId MUST be unique could cause problems later if someone wanted to add this functionality back in.  
- Can 2 customerIds share a single meter serial number? Would this equate to 2 customers paying for electricity distinctly, off of a shared single meter? Doesn't sound possible. In this case, a 'serialNumber' is quite tightly bound to 'customerId'
- What is the difference between 'serialNumber' and 'MPXN'? serial number identifies the meter. MPXN identifies the 'supply point'

### Research - meters and readings

#### Meter Point Numbers
Seems like they uniquely identify a utility SUPPLY but not meter.
> These numbers (MPAN for electricity, MPRN for gas) are unique to your electricity and gas supply and identify you within the electricity and gas industry. This isn’t the same as your **meter serial numbers**, which are printed on your meters.
https://www.ecotricity.co.uk/customer-service/pay-your-bill/your-bill-explained/your-electricity-and-gas-bill-explained

> How is \[serial number\] different to a supply number? The supply number (your MPRN or MPAN) is a reference point for the **property** where the meter is located. It's the point where we put the meter, not the meter itself. When a meter is replaced, the serial number will be different. **The supply number always stays the same.**
https://help.bulb.co.uk/hc/en-us/articles/115001228451-What-is-a-meter-serial-number-

#### Register ID
Seems like registerId is used to identify the rate/measurement/units of the value. Usually given as an alphanumeric code eg Kw I assume represents kilowatts, but in the schema for this excersise appears as a 6-digit integer, possibly just to keep things simple, or perhaps Ecotricity have a custom 6-digit enum/map system to identify meter registers? Either way, stick to 6-digit integer.

> Register IDs are the little numbers or letters on the left hand side of the reading (e.g. R1/R2/L/N etc). Please don’t forget to include them. 
https://www.ovoenergy.com/help/meter-reading-problems

> A digital meter is likely to have any number of registers from which you can take information from. The register ID, usually one or two characters in length (alpha and/or numeric) is used to identify the rate or measurement type. (Examples could be L, N, Kw, MD, r1, r2).The register value is the meter reading itself and will be between four and nine numeric characters.
https://www.ssebusinessenergy.co.uk/submit-meter-reading/


### API Requirements

#### Accept (POST)
- Accept JSON payload in request body
- Validate the request. Are all fields present? 
- customerId. Is it the right data type, length? Is it a uuid? Do we have an exisiting record for this id? 
- serialNumber. Is it the right data type (int), for simplicity lets say it is always expected to be a 12-digit int. Expected to be unique, but cannot be assured. We should therefore not check it's uniqueness, rely on customerId
- MPXN. Expect it to be a 8-digit int. Can check uniqueness since we are told it is unique. However, in the event that a customerId moves house, and a new customerId moves in, you would have a scenario where 2 distinct customerIds share meter serialNumber and MPXN, so enforcing unique MPXN would not allow this scenario; needs more thought.
- read. check it is an object array, length 2. Check each (both) objects have 3 properties, type, registerId, value.
  - type. check its a string, one must be "ANYTIME", the other must be "NIGHT"
  - registerId. we are told it uniquely identifies a register, but based on research it appears that 'register' is basicaly 'units' and is unique only locally to the meter, so we should only validate that it exists, and a is 6-digit integer
  - value. check its an integer. not sure if it can go over 4 digits? if we are allowing more than 1 reading per customer then the value should always be greater than the previous value we have in store for this particular customer/meter/MPXN/register
- readDate. looks like an [https://en.wikipedia.org/wiki/ISO_8601](ISO) date string. validate it is one. check that the date is not in the future! If we are accepting mulitple reads per customerId then a readDate should always be more recent than the most recent readDate on record.

#### Present (GET)

>Present - the route to present a meter reading should use **identifiers for the meter and the customer** to personalise what is returned. It should return the reads in a similar JSON format to the accept method.

- Return the read(s) in JSON in the response body.
- Pass in parameters to customise the query as query strings. Parameters should be validated in the same fashion as in the POST method; create a validation library that can shared across both (all) API methods.
- Query parameters:
  - customerId: get all the reading(s) for a specific customerId.
  - serialNumber: get all the reading(s) for a specifc meter. Compicated by the fact that "uniqueness cannot be assured"
- Present all readings for all customers if no customerId is specified
