const express = require('express');
const authRouter = require('./auth');
const submissionRouter = require('./submission');
const matchRouter = require('./match');
const problemRouter = require('./problem');

const app = express();

app.use('/auth/', authRouter);
app.use('/submission', submissionRouter);
app.use('/match', matchRouter);
app.use('/problem', problemRouter);

module.exports = app;
