const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatchSchema = new Schema({
    _id: { type: Schema.ObjectId, required: true },
    player1: { type: Schema.ObjectId, ref: 'User', required: true },
    player2: { type: Schema.ObjectId, ref: 'User', required: true },
    player1Score: { type: Number, required: true, default: 0 },
    player2Score: { type: Number, required: true, default: 0 },
    started: { type: Date, required: true, default: new Date() },
    ended: { type: Number, default: this.started },
    problem: {
        _id: { type: Schema.ObjectId, ref: 'Problem', required: true },
        description: { type: String, required: true },
        parExec: { type: Number, required: true },
        parMem: { type: Number, required: true },
        expectedStdout: { type: String, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);