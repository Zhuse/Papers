const express = require('express');
const authRouter = require('./auth');
const submissionRouter = require('./submission');
const matchRouter = require('./match');

const app = express();

app.use('/auth/', authRouter);
app.use('/submission', submissionRouter);
app.use('/match', submissionRouter);

module.exports = app;
