const { body, validationResult } = require('express-validator');
// helper file to prepare responses.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const apiResponse = require('../helpers/apiResponse');
const utility = require('../helpers/utility');
const UserModel = require('../models/UserModel');
const mailer = require('../helpers/mailer');
const { constants } = require('../helpers/constants');

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
  // Validate fields.
  body('firstName').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('lastName').isLength({ min: 1 }).trim().withMessage('Last name must be specified.')
    .isAlphanumeric()
    .withMessage('Last name has non-alphanumeric characters.'),
  body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .custom((value) => UserModel.findOne({ email: value }).then((user) => {
      if (user) {
        return Promise.reject(new Error('E-mail already in use'));
      }
    })),
  body('password').isLength({ min: 6 }).trim().withMessage('Password must be 6 characters or greater.'),
  // Sanitize fields.
  body('firstName').escape(),
  body('lastName').escape(),
  body('email').escape(),
  body('password').escape(),
  // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      }
      // hash input password
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) throw err
        // generate OTP for confirmation
        const otp = utility.randomNumber(4);
        // Create User object with escaped and trimmed data
        const user = new UserModel(
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            confirmOTP: otp,
          }
        );
        const html = `<p>Please Confirm your Account.</p><p>OTP: ${otp}</p>`;
        // Send confirmation email
        mailer.send(
          constants.confirmEmails.from,
          req.body.email,
          'Confirm Account',
          html,
        ).then(async () => {
          // Save user.
          await user.save()
          const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          };
          return apiResponse.successResponseWithData(res, 'Registration Success.', userData);

        }).catch((err) => {
          console.log(err);
          return apiResponse.errorResponse(res, err);
        });
      });
    } catch (err) {
      // throw error in json response with status 500.
      return apiResponse.errorResponse(res, err);
    }
  }];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
  body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid email address.'),
  body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),
  body('email').escape(),
  body('password').escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      }
      UserModel.findOne({ email: req.body.email }).then((user) => {
        if (!user) return apiResponse.unauthorizedResponse(res, 'Email or Password wrong.');
        // Compare given password with db's hash.
        bcrypt.compare(req.body.password, user.password, (err, same) => {
          if (!same) return apiResponse.unauthorizedResponse(res, 'Email or Password wrong.');
          // Check account confirmation.
          if (!user.isConfirmed) return apiResponse.unauthorizedResponse(res, 'Account is not confirmed. Please confirm your account.');
          // Check User's account active or not.
          if (!user.status) return apiResponse.unauthorizedResponse(res, 'Account is not active. Please contact admin.');

          const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          };
          // Prepare JWT token for authentication
          const jwtPayload = userData;
          const jwtData = {
            expiresIn: process.env.JWT_TIMEOUT_DURATION,
          };
          const secret = process.env.JWT_SECRET;
          // Generated JWT token with Payload and secret.
          userData.token = jwt.sign(jwtPayload, secret, jwtData);
          return apiResponse.successResponseWithData(res, 'Login Success.', userData);
        });
      });
    } catch (err) {
      return apiResponse.errorResponse(res, err);
    }
  }];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
  body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid email address.'),
  body('otp').isLength({ min: 1 }).trim().withMessage('OTP must be specified.'),
  body('email').escape(),
  body('otp').escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      }
      const query = { email: req.body.email };
      UserModel.findOne(query).then((user) => {
        if (!user) return apiResponse.unauthorizedResponse(res, 'Specified email not found.');
        // Check already confirm or not.
        if (user.isConfirmed) return apiResponse.unauthorizedResponse(res, 'Account already confirmed.');
        // Check account confirmation.
        if (user.confirmOTP !== req.body.otp) return apiResponse.unauthorizedResponse(res, 'OTP does not match');
        // Update user as confirmed
        UserModel.findOneAndUpdate(query, {
          isConfirmed: 1,
          confirmOTP: null,
        }).catch((err) => apiResponse.errorResponse(res, err));
        return apiResponse.successResponse(res, 'Account confirmed success.');
      });
    } catch (err) {
      return apiResponse.errorResponse(res, err);
    }
  }];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
  body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid email address.'),
  body('email').escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      }
      const query = { email: req.body.email };
      UserModel.findOne(query).then((user) => {
        if (!user) return apiResponse.unauthorizedResponse(res, 'Specified email not found.');
        // Check already confirmed or not.
        if (user.isConfirmed) return apiResponse.unauthorizedResponse(res, 'Account already confirmed.');
        // Generate otp
        const otp = utility.randomNumber(4);
        // Html email body
        // Send confirmation email
        mailer.send(
          constants.confirmEmails.from,
          req.body.email,
          'Confirm Account',
          html,
        ).then(() => {
          user.isConfirmed = 0;
          user.confirmOTP = otp;
          // Save user.
          user.save((err) => {
            if (err) { return apiResponse.errorResponse(res, err); }
            return apiResponse.successResponse(res, 'Confirm OTP sent.');
          });
        });
      });
    } catch (err) {
      return apiResponse.errorResponse(res, err);
    }
  }];
