const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const auth = require('../middlewares/jwt');

// helper file to prepare responses.
const UserModel = require('../models/UserModel');


// Users Schema
function UserData(data) {
  this.firstName = data.firstName
  this.lastName = data.lastName
  this.email = data.email
  this.isConfirmed = data.isConfirmed
  this.confirmOTP = data.confirmOTP
  this.otpTries = data.otpTries
  this.elo = data.elo
  this.status = data.status
}

/**
 * User Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.userDetail = [
  auth,
  function (req, res) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.successResponseWithData(res, 'Operation success', {});
      }
      try {
          UserModel.findOne({ _id: req.params.id }).then((user) => {
            const userData = user !== null? new UserData(user): {}
            return apiResponse.successResponseWithData(res, 'Operation success', {});
          });
      } catch (err) {
          // throw error in json response with status 500.
          return apiResponse.errorResponse(res, err);
      }
  },
];

/**
 * Update user elo.
 *
 * @param {string}      id
 * @param {number}      elo
 *
 * @returns {Object}
 */
exports.updateElo = [
  auth,
  function (req, res) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.successResponseWithData(res, 'Operation success', {});
      }
      try {
          UserModel.findOneAndUpdate({ _id: req.params.id }, { elo: req.params.elo }, { returnOriginal: false}).then((user) => {
            const userData = user !== null? new UserData(user): {}
            return apiResponse.successResponseWithData(res, 'Operation success', {});
          });
      } catch (err) {
          // throw error in json response with status 500.
          return apiResponse.errorResponse(res, err);
      }
  },
];

/**
 * Update user elo.
 *
 * @param {string}      id
 * @param {number}      elo
 *
 * @returns {Object}
 */
exports.numMatches = [
  auth,
  function (req, res) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.successResponseWithData(res, 'Operation success', {});
      }
      try {
          MatchModel.count({ $or: [{ player1: req._id }, { player2: req._id }] }).then((user) => {
            const userData = user !== null? new UserData(user): {}
            return apiResponse.successResponseWithData(res, 'Operation success', {});
          });
      } catch (err) {
          // throw error in json response with status 500.
          return apiResponse.errorResponse(res, err);
      }
  },
];
