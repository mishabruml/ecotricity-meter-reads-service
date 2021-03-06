[![CircleCI](https://circleci.com/gh/mishabruml/ecotricity-meter-reads-service.svg?style=svg&circle-token=03ec99b9a671f59b392d863289ff811e2e995b61)](https://circleci.com/gh/mishabruml/ecotricity-meter-reads-service)
[![codecov](https://codecov.io/gh/mishabruml/ecotricity-meter-reads-service/branch/master/graph/badge.svg?token=8MMOKrNLn0)](https://codecov.io/gh/mishabruml/ecotricity-meter-reads-service)

# ecotricity-meter-reads-service

Ecotricity meter reads service! An API to accept/present customer's electricity meter readings.

# Contents

[Usage](#usage)

[System Design](#system-design)

[Initial Notes](#initial-notes)

[Design ideas](#design-ideas)

[Ponderings](#ponderings)

## Usage <a name="usage"></a>

The API is deployed live at [https://ecotricity.now.sh/meter-read](https://ecotricity.now.sh/meter-read). Alternatively, see section [Developers](#developers) for information on how to run the server locally.

Visiting that URL in a browser will of course send a `GET` request to the endpoint, and given there are no queries specified, will return all meter readings in the database. This is probably a bad design choice from a security perspective, but I built this API with simplicity and usability in mind; the code is modular enough that this functionality could be limited to admins only, or something like that.

Anyway, the recommended tool to test this API well, rather than a browser, would be [curl](https://curl.haxx.se/) or more friendly, [Postman](https://www.getpostman.com/)

### GET /meter-read

Endpoint used for retrieving meter readings from the database. Meter readings are returned as JSON in the response body. Optionally specify parameters to query by, using querystrings. At time of writing, the allowed querystring parameters are:

 - customerId 
 - serialNumber 
 - mpxn 
 - readDate 
 - createdAt

Any call with a querystring that is *not* in the above list, or formatted incorrectly, will receive an appropriate API response;

#### Disallowed querystring

```bash
curl -X GET \
  'https://ecotricity.now.sh/meter-read?notallowedthis=data123' \
  ```

Receives response code 400, with message `QuerystringError: data should NOT have additional properties. Allowed query parameters: customerId,serialNumber,mpxn,readDate,createdAt`

#### Invalid querystring format

```bash
curl -X GET \
  'https://ecotricity.now.sh/meter-read?customerId=123abc' 
  ```
Note that `customerId` is `123abc`, which is not a valid [uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)

Receives response code 400, with message `QuerystringError: data.customerId should match format "uuid". Allowed query parameters: customerId,serialNumber,mpxn,readDate,createdAt`

#### Get all meter readings

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

If no matching meter reading(s) cannot be found, the API responds with status 404 and body: `No reading(s) found for query {"customerId":"ffec5567-3314-4e7c-b2a8-45456832762a"}`

### POST /meter-read

Endpoint used for putting new meter readings into the database. The reading data is sent via JSON in the POST body, and is strictly validated against the schema. The POST is also checked for idempotency and uniqueness- see the Idempotency section in [System Design](#system-design). Finding it fiddly to come up with unique POST bodies or arduous to generate "authentic" random customer data? Don't worry, I've written a tool to do it for you! See the Dev Tools section in [Developers](#developers). You'll need to have the system set up locally, though. 

The POST expects a request header `Idempotency-Key` which must be a `uuid`. Set your header in curl with the `-H` flag, you'll need to generate a uuid though. You could use [https://www.guidgenerator.com/](https://www.guidgenerator.com/) or something similar. My preferred method, however, is to send the requests in Postman, set the `Idempotency-Key` header, and use the `{{guid}}` global variable as the value. This will generate a `uuid` for you at runtime (when you hit send)

![](https://github.com/mishabruml/ecotricity-meter-reads-service/raw/master/assets/guidPostman.png "Using postman to create uuid")

#### POST a valid meter reading

```bash
curl -X POST \
  https://ecotricity.now.sh/meter-read \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: b5dbc3e0-e444-4058-8bc0-1e20ce1bb835' \
  -d '{
    "customerId": "ffec5567-3314-4e7c-b2a8-45456832762b",
    "serialNumber": "32442325626",
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
    "readDate": "2018-11-29T07:34:10.649Z"
}'
```

This will respond with status code 201 and body JSON with the created resource (meter reading).

```JSON
{
    "_id": "5d66c3c3f119d200072c48d8",
    "customerId": "ffec5567-3314-4e7c-b2a8-45456832762b",
    "serialNumber": "32442325626",
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
    "idempotencyKey": "e75ee154-0834-4d95-b3c7-97ec9a30761e",
    "createdAt": "2019-08-28T18:11:15.200Z",
    "__v": 0
}
```

Note that the server returns the full mongodb document, with all fields. The `_id` field is really for developers, it's useful to quickly be able to reference the document in the database at a later time. 

#### Invalid requests

The system will handle invalid data and respond appropriately. 

##### Absent properties
Each of the following body properties: `[customerId, serialNumber, mpxn, read, readDate]` is **required** and if absent, the server will respond with a response code 400 and an appropriate message; for example, sending a meter reading that is missing the `serialNumber` will respond;

`400: ValidationError: data should have required property 'serialNumber'`

##### Invalid formatting
Each of the required fields must be formatted as per the schema spec- see schema section in [System Design](#system-design). Any requests sent with invalid formatting will respond with a status code 400 and appropriate message. For example, sending a meter reading with `"customerId":"12345"` (not a uuid string) will respond:

`400: ValidationError: data.customerId should match format "uuid"`

Sending a reading with `"mpxn":1` (and constant `MPXN_LENGTH` set to 8, for example) will respond 

`400: ValidationError: data.mpxn should NOT be shorter than 8 characters, data.mpxn should match pattern "^\w{8}$"`

Sending a reading with a `read` value sent as a string `"value":"1234"` rather than a number `"value":1234` will respond:

`400: ValidationError: data.read[0].value should be number`

Sending a reading with a `read` value outwith the limits specified in constants.js, for example  `"value": 10000` will respond:

`400: ValidationError: data.read[0].value should be <= 9999`

##### Idempotency

For information about how this system is implemented, see the Idempotency section in [System Design](#system-design)

###### Idempotency-Key header

Sending a POST with a missing Idempotency-Key header will respond:

`400: ValidationError: Request header Idempotency-Key data should be string`

Sending a POST with an Idempotency-Key header that is not a uuid, e.g.

```bash
curl -X POST \
  http://localhost:3000/meter-read \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 12345' \
```
Response: `400: ValidationError: Request header Idempotency-Key data should match format "uuid"`

Sending a duplicate POST i.e. with an Idempotency-Key header that matches an existing key in the database will respond:

`409: IdempotencyError: Found existing record(s) matching the idempotency key c56c88e4-3f1c-46dc-8993-539ddde73630`

Sending a POST twice without changing the body, but changing the `Idempotency-Key` to a new uuid will respond: 

`409: DuplicateError: Found existing record(s) matching the provided data {"customerId":"ffec5567-3314-4e7cb2a8-45456832762a","serialNumber":"12345678910","mpxn":"12345678","read:[{"type":"ANYTIME","registerId":"NWemRz","value":9999},{"type":"NIGHT","registerId":"NWemRz","value":3389}],"readDate":"2018-11-29T07:34:10.649Z"}`

## Developers <a name="developers"></a>

### Local build 

Requirements: `git`, `node`, `npm`, [Now](https://zeit.co/docs) - although shipped as a dev-dependency, you made need to install it yourself globally to run the CLI properly: `npm i -g now`

You need a `.env` file in the project root directory. This has the connection string to the database, and the codecov token for uploading code coverage reports. Contact mishabruml at gmail dot com if you would like a copy of these keys! You could also create your own `.env` file pointing to your own mongodb and codecov account. You could, for instance, spin up a local mongodb server and point the local application to that, for your own testing. 

```
.env:
	PROD_DB_URI=db.connection-string.com/mydb
	CODECOV_TOKEN=*******
```

Useful: `mongo` (local db server), `Postman` (API testing)

Clone the repository with `git clone`
Install the dependencies with `npm install`
To start the local development server, type `npm run local`, or  `now dev` if you have Now installed globally, or `npx now dev` if not. These are all equivalent. 

This will start up a local development server on `localhost`! Default is port 3000- I think you can specify this if you like, check the Now docs. You should now be able to hit your local server with Postman or whatever to test the API.

### Testing

The unit testing suite is written in Mocha, and is reasonably extensive. It tests the schemas, data validation libraries, custom error classes and the database controller. I wrote a random reading generator factory/library using [Chance.js](https://chancejs.com/) to create simulated (valid) submitted meter reading objects. I use this for example in testing validation; generate a reading, then swap a valid property for a (known) invalid one, run the validation on the data, and assert that the right bit of invalid data was caught. 

You can run single tests by using `mocha .only` on `describes`, and run with with `npm test`, or run the whole suite with `npm run test:all`

You can run a test coverage report with `npm run test-coverage`. This will output the report to console, and also output to `.nyc_output`.


### Dev Tools

#### Post mock data

There is a tool to POST mock/pseudo-random data to the database! Found in `src/util/helpers/postMockData.js` it could be exposed via API as a development endpoint, or more simply it can be invoked with `npm run post-mock-data`

You will need the connection string in `.env` to use it. It makes use of the generateRandomReading library discussed above, to generate a complete (random) POST request from an imaginary user, complete with a valid `Idempotency-Key`, it then calls the POST method with this data and sends the data to the database. Usefully, the data sent to the database is logged to console, so it can be inspected by the developer. This is the really useful if you'd like to test the GET endpoint but don't know what data is in the database; simply create a new record with this tool and the you have all the data you need, in the database, ready to test the GET endpoint. 

#### Cloc

There is a tool to get stats on the codebase, using [cloc](http://cloc.sourceforge.net/). 
Run `npm run cloc`to run the report and view it in the console. At the time of the writing, the codebase is 35 files, 3797 lines of code.

## System Design <a name="system-design"></a>

### API Design and Platform
This service is built as a RESTful API using primarily Node.js. It is designed to be deployed as a serverless API, using [Now](https://zeit.co/) platform. This was chosen as it is free, open source (ish), and easy to get a live API up and running in no time. It is effectively a sugary wrapper around AWS Lambdas, so the Node.Js code that provides the actual valuable logic could easily be re-purposed onto a (more enterprise) API-Gateway/Lambda stack for instance. I chose not to do this myself since a) it would be fun to learn a new technology and b) I thought it would be more difficult and fiddly than using an out-the-box tool like Now. The API is designed to be RESTful, with a single endpoint `/meter-read` with two available methods, `GET` and `POST`, for accepting and presenting meter readings. I wrote this API with a strong emphasis on strict data validation, at the request-level, and again at the database-level via schemas.


### Database

I chose the persistence layer to be MongoDB, mostly because I am familiar with it, and it works very conveniently with NodeJs. The database is deployed live to the cloud using a free-tier M0 sandbox cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Schema

I wrote a couple of different schemas for different use cases/consumption by different modules, but consistency across them is ensured by `src/lib/constants`

The schemas for validating incoming data with `ajv` (JSON schema validation library), can be found in `src/lib/schemas`. 

There are different schema for POST and GET bodies because the GET request accepts a subset of the fields. I used subschema for each field, and constants, to compile the "parent" schemas, ensure consistency between the two schema. 

The [mongoose schema](https://mongoosejs.com/docs/guide.html) I defined for db-level validation by mongodb can be found in `src/db/models/readingModel.js`. Strictly speaking, in this file I am exporting not the schema, but the *model*, compiled from the schema with the mongoose driver, as this is more practical for use elsewhere in the codebase. 

The "root" or "common" schema looks like this (pseudocode):

```
{
  customerId: {string, uuid},
  serialNumber: {string, numeric, 11 chars},
  mpxn: {string, alphanumeric, 8 chars}
  read: [
    { type: 'ANYTIME', registerId: {string, alphanumeric, 6 chars}, value: {number between 0 and 9999} },
    { type: 'NIGHT', registerId: {string, alphanumeric, 6 chars}, value: {number between 0 and 9999} },  ]
  readDate: {string, ISO date},
  idempotencyKey: {string, uuid},
  createdAt: {string, ISO date},
}
```

*NB: in the db there will also be mongodb native `_id` and `_v` fields, not shown here.* 

The string lengths (number of characters) and some other properties about the schema are not hardcoded; they can be controlled with constants set in `/src/lib/constants.js`

The `read` object expects exactly one of each "reading" per `REQUIRED_READ_TYPES` as specced in constants. That means that if the developer later decided that each `read` now requires a third reading type, `"DAY"`, for example, they could just add it to the array in `REQUIRED_READ_TYPES` and the schema would be adjusted dynamically.

I chose to add two fields to the schema. `idempotencyKey` is used to control POST request idempotency, as explained in the next section. `createdAt` is a field automatically created by MongoDB at the document creation time; it is therefore not required in the POST body. The `createdAt` date could be used for lots of useful things, such as determining when a customer *submitted* a reading, rather than when then the reading was taken from the meter, or in debugging - timestamps on errors in the server logs could be correlated with `createdAt` to find out if a bug was caused by creating a particular document.

### Idempotency 

Two measures were taken to ensure idempotency for the POST route; the thing I wanted to avoid was creating the same resource twice for exactly the same request. 

The "network duplication idempotency" problem manifests as exactly the same request hitting the POST route twice, caused by a network error/lag/automatic retry or similar. The request is identical in every way. I solved this problem by adding an `idempotencyKey` to my schema; every meter reading that is created expects a unique key. I chose `guid` as my key, as its guaranteed to be unique, commonly used, and easy to work with. The `idempotencyKey` is set as a header in the POST request, **and so must be generated at the time of sending by the client**. When the request hits the server, the key is checked against entries in the db, and if no matches are found, the request is assumed to be genuinely unique, and is processes.

The second idempotency problem manifests as "client accidently sending exactly the same POST body twice or more. This will mean they have distinct `idempotencyKey`headers for each request, but the body will be identical. I solved this with a validation mechanism that checks the database for an exact match for the incoming request, and if found, the server responds with code 409 conflict, and a handy message about the duplication.

### Deployment, CI/CD, testing, DevOps, other goodies

This codebase is hosted on github, which was chosen because I am really comfortable with it. I used it's features extensively, even for a team of 1 (me) things like PR's were really handy.

The app is deployed to Now platform; one of the great things about Now, is the out-the-box continuous deployments when configured with github; Now sits on top of github as a github 'app' and deploys my app for me. `master` and `dev` branches have special status, as the master branch deploys to my main production environment and URL, and `dev` to a dev environment, but also *any* feature branch is deployed at it's own staging url. This is super handy for development and allowed me to move really fast and hassle-free, and allowed regular testing of the API in a deployed context.

The test suite is written in [mocha](https://mochajs.org/) see test section in [developers](#developers) for more on that specifically. Code coverage is provided by [nyc/istanbul](https://istanbul.js.org/), and the reporting is provided by [codecov](https://codecov.io/). I wrote some npm scripts (see `package.json`) to test my code, run a coverage report, and upload it to my Codecov account. This can be linked to my github repo, which is what gives me my shiny codecov coverage % badge, at the top of this page!

The thing missing from Now was automated testing (and any other automation); so I set it up myself with [circleci](https://circleci.com/). Another free service, this is essentially Cloud-based linux containers/VMs to run whatever you like in, but specifically designed for CI/CD. I created a simple config script that checks out my project code, builds, and runs the mocha test suite. It will 'fail' the build for a failure in the connection to github, an npm build failure, or any failing test. The script then invokes my test coverage and reporting scripts to automatically keep my coverage stats up to date.

I installed the Now, CircleCi and CodeCov github apps, which means my github is all linked to these outside services. I made branch protection rules, enforcing status checks for the CircleCi and Now stages, which means that for any branch pushed to my repo, the unit test suite is ran, code coverage reports made and uploaded, and a deployment made. If any of those stages fail, the status check will fail, meaning that the branch cannot be merged into the main code-base. 

Once set up, this gave me much more confidence in my development, to try out wacky things, move quickly, and be sure that my safety net would catch me if I did anything daft (and trust me, I did- so it worked!)

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
  - serialNumber: get all the reading(s) for a specific meter. Complicated by the fact that "uniqueness cannot be assured"
- Present all readings for all customers if no customerId is specified
