[![CircleCI](https://circleci.com/gh/mishabruml/ecotricity-meter-reads-service.svg?style=svg&circle-token=03ec99b9a671f59b392d863289ff811e2e995b61)](https://circleci.com/gh/mishabruml/ecotricity-meter-reads-service)
[![codecov](https://codecov.io/gh/mishabruml/ecotricity-meter-reads-service/branch/master/graph/badge.svg?token=8MMOKrNLn0)](https://codecov.io/gh/mishabruml/ecotricity-meter-reads-service)

# ecotricity-meter-reads-service

Ecotricity meter reads service! An API to accept/present customer's electricity meter readings.

# Contents

[Initial Notes](#initial-notes)

[Design ideas](#design-ideas)

[Ponderings](#ponderings)

## Usage

### API
The API is deployed live at [https://ecotricity.now.sh/meter-read](https://ecotricity.now.sh/meter-read). Alternatively, see section "Developers" for information on how to run the server locally.

Visiting that URL in a browser will of course send a `GET` request to the endpoint, and given there are no queries specified, will return all meter readings in the database. This is probably a bad design choice from a security perspective, but I built this API with simplicity and usability in mind; the code is modular enough that this functionality could be limited to admins only, or something like that.

Anyway, the recommended tool to test this API well, rather than a browser, would be [curl](https://curl.haxx.se/) or more friendly, [Postman](https://www.getpostman.com/)

#### GET /meter-read

Endpoint used for retrieving meter readings from the database. Meter readings are returned as JSON in the response body. Optionally specify parameters to query by, using querystrings. At time of writing, the allowed querystring parameters are:

 - customerId 
 - serialNumber 
 - mpxn 
 - readDate 
 - createdAt

Any call with a querystring that is *not* in the above list, or formatted incorrectly, will receive an appropriate API response;

##### Disallowed querystring

```bash
curl -X GET \
  'https://ecotricity.now.sh/meter-read?notallowedthis=data123' \
  ```

Receives response code 400, with message `QuerystringError: data should NOT have additional properties. Allowed query parameters: customerId,serialNumber,mpxn,readDate,createdAt`

##### Invalid querystring format

```bash
curl -X GET \
  'https://ecotricity.now.sh/meter-read?customerId=123abc' 
  ```
Note that `customerId` is `123abc`, which is not a valid [uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)

Receives response code 400, with message `QuerystringError: data.customerId should match format "uuid". Allowed query parameters: customerId,serialNumber,mpxn,readDate,createdAt`

##### Get all meter readings

```bash
curl -X GET \
  'https://ecotricity.now.sh/meter-read' 
  ```

Response 200, returns all meter readings in database

##### Get meter reading(s) for a specific parameter

In this example, we are searching for readings for a specific `customerId`, but you could also search for any of the other allowed querystrings (mpxn, serialNumber...) on their own, or together, and in any combination, including all at once; just add them into the querystring.

```bash
curl -X GET \
  'https://ecotricity.now.sh/meter-read?customerId=ffec5567-3314-4e7c-b2a8-45456832762a'
 ```

If a matching meter reading can be found, the API responds with a status 200 and `body`:

```json
[
    {
        "customerId": "ffec5567-3314-4e7c-b2a8-45456832762a",
        "serialNumber": 32442325626,
        "mpxn": "h9AhDhUt",
        "read": [
            {
                "type": "ANYTIME",
                "registerId": "NWemRz",
                "value": 9945
            },
            {
                "type": "NIGHT",
                "registerId": "NWemRz",
                "value": 3389
            }
        ],
        "readDate": "2018-11-29T07:34:10.649Z",
        "createdAt": "2019-08-28T12:36:37.256Z"
    }
]
```

If a matching meter reading cannot be found, the API responds with status 404 and body: `No reading(s) found for query {"customerId":"ffec5567-3314-4e7c-b2a8-45456832762a"}`

## System Design

### API Design and Platform
This service is built as a RESTful API using primarily Node.js. It is designed to be deployed as a serverless API, using [Now](https://zeit.co/) platform. This was chosen as it is free, open source (ish), and easy to get a live API up and running in no time. It is effectively a sugary wrapper around AWS Lambdas, so the Node.Js code that provides the actual valuable logic could easily be re-purposed onto a (more enterprise) API-Gateway/Lambda stack for instance. I chose not to do this myself since a) it would be fun to learn a new technology and b) I thought it would be more difficult and fiddly than using an out-the-box tool like Now. The API is designed to be RESTful, with a single endpoint `/meter-read` with two available methods, `GET` and `POST`, for accepting and presenting meter readings.


### Database

I chose the persistence layer to be MongoDB, mostly because I am familiar with it, and it works very conveniently with NodeJs. The database is deployed live to the cloud using a free-tier M0 sandbox cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Idempotency 

Two measures were taken against idempotency in the POST route; the thing I wanted to avoid was creating the same resource twice for exactly the same request. 

The "network duplication idempotency" problem manifests as exactly the same request hitting the POST route twice, caused by a network error/lag/automatic retry or similar. The request is identical in every way. I solved this problem by adding an `idempotencyKey` to my schema; every meter reading that is created expects a unique key. I chose `guid` as my key, as its guaranteed to be unique, commonly used, and easy to work with. The `idempotencyKey` is set as a header in the POST request, **and so must be generated at the time of sending by the client**. When the request hits the server, the key is checked against entries in the db, and if no matches are found, the request is assumed to be genuinely unique, and is processes.

The second idempotency problem manifests as "client accidently sending exactly the same POST body twice or more. This will mean they have distinct `idempotencyKey`headers for each request, but the body will be identical. I solved this with a validation mechanism that checks the database for an exact match for the incoming request, and if found, the server responds with code 409 conflict, and a handy message about the duplication.

### Other

The codebase is as modular as possible, and focuses on consistency, abstraction, reliability, scalability, fault-tolerance and error-handling. **Not** considered (much) were: performance, speed, latency, security.
	
## Initial Notes - written before I started any code<a name="initial-notes"></a>

### Design ideas <a name="design-ideas"></a>

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

### Ponderings <a name="ponderings"></a>

- Should the system accept multiple readings for a single customerId? Would this update the reading (arguably a PUT request) or create a new db entry for the read, same customerId and meter meta-data, different date and values. If yes, then customerId cannot be used to index the database (not unique). Also this would add further complexity; find previous entry, validate the incoming date is later, validate the meter read values have increased, so on. For an MVP, allowing 1 reading per customerId would make things a lot simpler. However, designing a system where customerId MUST be unique could cause problems later if someone wanted to add this functionality back in.
- Can 2 customerIds share a single meter serial number? Would this equate to 2 customers paying for electricity distinctly, off of a shared single meter? Doesn't sound possible. In this case, a 'serialNumber' is quite tightly bound to 'customerId'
- What is the difference between 'serialNumber' and 'MPXN'? serial number identifies the meter. MPXN identifies the 'supply point'

### Research - meters and readings

#### Meter Point Numbers

Seems like they uniquely identify a utility SUPPLY but not meter.

> These numbers (MPAN for electricity, MPRN for gas) are unique to your electricity and gas supply and identify you within the electricity and gas industry. This isn’t the same as your **meter serial numbers**, which are printed on your meters.
> https://www.ecotricity.co.uk/customer-service/pay-your-bill/your-bill-explained/your-electricity-and-gas-bill-explained

> How is \[serial number\] different to a supply number? The supply number (your MPRN or MPAN) is a reference point for the **property** where the meter is located. It's the point where we put the meter, not the meter itself. When a meter is replaced, the serial number will be different. **The supply number always stays the same.** > https://help.bulb.co.uk/hc/en-us/articles/115001228451-What-is-a-meter-serial-number-

#### Register ID

Seems like registerId is used to identify the rate/measurement/units of the value. Usually given as an alphanumeric code eg Kw I assume represents kilowatts, but in the schema for this excersise appears as a 6-digit integer, possibly just to keep things simple, or perhaps Ecotricity have a custom 6-digit enum/map system to identify meter registers? Either way, stick to 6-digit integer.

> Register IDs are the little numbers or letters on the left hand side of the reading (e.g. R1/R2/L/N etc). Please don’t forget to include them.
> https://www.ovoenergy.com/help/meter-reading-problems

> A digital meter is likely to have any number of registers from which you can take information from. The register ID, usually one or two characters in length (alpha and/or numeric) is used to identify the rate or measurement type. (Examples could be L, N, Kw, MD, r1, r2).The register value is the meter reading itself and will be between four and nine numeric characters.
> https://www.ssebusinessenergy.co.uk/submit-meter-reading/

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

> Present - the route to present a meter reading should use **identifiers for the meter and the customer** to personalise what is returned. It should return the reads in a similar JSON format to the accept method.

- Return the read(s) in JSON in the response body.
- Pass in parameters to customise the query as query strings. Parameters should be validated in the same fashion as in the POST method; create a validation library that can shared across both (all) API methods.
- Query parameters:
  - customerId: get all the reading(s) for a specific customerId.
  - serialNumber: get all the reading(s) for a specifc meter. Compicated by the fact that "uniqueness cannot be assured"
- Present all readings for all customers if no customerId is specified
