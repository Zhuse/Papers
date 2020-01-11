const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const mongoose = require('mongoose');
const Match = require('../models/MatchModel');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');
const httpHelpers = require('../helpers/httpHelpers');

mongoose.set('useFindAndModify', false);

// Match Schema
function MatchData(data) {
    this._id = data._id;
    this.player1 = data.player1;
    this.player2 = data.player2;
    this.player1Score = data.player1Score;
    this.player2Score = data.player2Score;
    this.started = data.started;
    this.ended = data.ended;
}

/**
 * Match List.
 *
 * @returns {Object}
 */
exports.matchList = [
    auth,
    function (req, res) {
        try {
            Match.find({ $or: [{ player1: req.user._id }, { player2: req.user._id }] }).then((matchs) => {
                if (matchs.length > 0) {
                    return apiResponse.successResponseWithData(res, 'Operation success', matchs);
                }
                return apiResponse.successResponseWithData(res, 'Operation success', []);
            });
        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

/**
 * Match Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.matchDetail = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, 'Operation success', {});
        }
        try {
            Match.findOne({ $or: [{ player1: req.user._id }, { player2: req.user._id }] }).then((match) => {
                if (match !== null) {
                    const matchData = new MatchData(match);
                    return apiResponse.successResponseWithData(res, 'Operation success', matchData);
                }
                return apiResponse.successResponseWithData(res, 'Operation success', {});
            });
        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

exports.matchStore = function (payload) {
    const match = new Match(
        {
            _id: payload._id,
            player1: payload.player1,
            player2: payload.player2,
            player1Score: payload.player1Score,
            player2Score: payload.player2Score,
            started: payload.started,
            ended: payload.ended,
        }
    );
    // Save match.
    return match.save(match);
}
