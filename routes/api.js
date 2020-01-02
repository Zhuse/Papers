const express = require('express');
const authRouter = require('./auth');
const bookRouter = require('./book');
const submissionRouter = require('./submission');

const app = express();

app.use('/auth/', authRouter);
app.use('/book/', bookRouter);
app.use('/submission', submissionRouter);

module.exports = app;
