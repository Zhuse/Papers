const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const apiResponse = require('./helpers/apiResponse');

/* Swagger document setup */
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

// DB connection
const { MONGODB_URL } = process.env;

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  // don't show the log when it is test
  if (process.env.NODE_ENV !== 'test') {
    console.log('Connected to %s', MONGODB_URL);
    console.log('App is running ... \n');
    console.log('Press CTRL + C to stop the process. \n');
  }
})
  .catch((err) => {
    console.log(err);
    console.error('App starting error:', err.message);
    process.exit(1);
  });
const db = mongoose.connection;

const app = express();

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// To allow cross-origin requests
app.use(cors());

// Route Prefixes
app.use('/', indexRouter);
app.use('/api/', apiRouter);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// throw 404 if URL not found
app.all('*', (req, res) => apiResponse.notFoundResponse(res, 'Page not found'));

app.use((err, req, res) => {
  if (err.name == 'UnauthorizedError') {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

module.exports = app;
