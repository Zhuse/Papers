const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProblemSchema = new Schema({
    stdinTest: { type: String, required: true},
    description: { type: String, required: true},
    parExec: { type: Number, required: true},
    parMem: { type: Number, required: true},
    expectedStdout: { type: String, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Problem', ProblemSchema);