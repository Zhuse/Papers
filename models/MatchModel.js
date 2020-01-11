const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatchSchema = new Schema({
    _id: { type: String },
    player1: { type: Schema.ObjectId, ref: 'User', required: true },
    player2: { type: Schema.ObjectId, ref: 'User', required: true },
    player1Score: { type: Number, required: true, default: 0 },
    player2Score: { type: Number, required: true, default: 0 },
    started: { type: Date, required: true, default: new Date() },
    ended: { type: Number, default: this.started },
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);