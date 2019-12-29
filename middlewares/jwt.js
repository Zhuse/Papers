const jwt = require('express-jwt');

const secret = process.env.JWT_SECRET;

const authenticate = jwt({
  secret,
});

module.exports = authenticate;
