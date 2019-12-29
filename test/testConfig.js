// During the automated test the env variable, We will set it to "test"
process.env.NODE_ENV = 'test';
process.env.MONGODB_URL = 'mongodb://127.0.0.1:27017/rest-api-nodejs-mongodb-test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();
chai.use(chaiHttp);

// Export this to use in multiple files
module.exports = {
  chai,
  server,
  should,
};
