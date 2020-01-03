const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const mongoose = require('mongoose');
const Submission = require('../models/SubmissionModel');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');
const httpHelpers = require('../helpers/httpHelpers');

mongoose.set('useFindAndModify', false);

// Submission Schema
function SubmissionData(data) {
    this.id = data._id;
    this.language_id = data.language_id;
    this.source_code = data.source_code;
    this.user = data.user;
    this.time = data.time;
    this.memory = data.memory;
    this.stderr = data.stderr;
    this.stdout = data.stdout;
    this.token = data.token;
    this.compile_output = data.compile_output;
    this.message = data.message;
    this.status = data.status;
}

/**
 * Submission List.
 *
 * @returns {Object}
 */
exports.submissionList = [
    auth,
    function (req, res) {
        try {
            Submission.find({ user: req.user._id }).then((submissions) => {
                if (submissions.length > 0) {
                    return apiResponse.successResponseWithData(res, 'Operation success', submissions);
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
 * Submission Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.submissionDetail = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, 'Operation success', {});
        }
        try {
            Submission.findOne({ _id: req.params.id, user: req.user._id }).then((submission) => {
                if (submission !== null) {
                    const submissionData = new SubmissionData(submission);
                    return apiResponse.successResponseWithData(res, 'Operation success', submissionData);
                }
                return apiResponse.successResponseWithData(res, 'Operation success', {});
            });
        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

/**
 * Submission store.
 *
 * @param {string}      source_code
 * @param {string}      language_id
 *
 * @returns {Object}
 */
exports.submissionStore = [
    auth,
    body('language_id', 'Must choose a language').custom((value) => {
        if (value >= 1 || value <= 44) {
            return true;
        }
        throw new Error('Invalid Language');
    }),
    body('user', 'User must not be empty').isLength({ min: 1 }).trim(),
    (req, res) => {
        try {
            console.log(req.body)
            httpHelpers.post('/submissions', {
                source_code: req.body.source_code,
                language_id: req.body.language_id
            })
                .then((execResult) => {
                    const errors = validationResult(req);
                    const submission = new Submission(
                        {
                            language_id: req.body.language_id,
                            source_code: req.body.source_code,
                            user: req.body.user,
                            time: execResult.time,
                            memory: execResult.memory,
                            stdout: execResult.stdout,
                            stderr: execResult.stderr,
                            token: execResult.token,
                            compile_output: execResult.compile_output,
                            message: execResult.message,
                            status: execResult.status
                        }
                    );

                    if (!errors.isEmpty()) {
                        throw new Error('Something wrong happened. Please try again later.');
                    }
                    // Save submission.
                    submission.save((err) => {
                        if (err) { return apiResponse.ErrorResponse(res, err); }
                        const submissionData = new SubmissionData(submission);
                        return apiResponse.successResponseWithData(res, 'Submission add Success.', submissionData);
                    });
                })
                .catch(err => {
                    return apiResponse.validationErrorWithData(res, 'Submission Failed', err);
                })
        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

/**
 * Submission Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.submissionDelete = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid ID');
        }
        try {
            Submission.findById(req.params.id, (err, foundSubmission) => {
                if (foundSubmission === null) {
                    return apiResponse.notFoundResponse(res, 'Submission not exists with this id');
                }
                // Check authorized user
                if (foundSubmission.user.toString() !== req.user._id) {
                    return apiResponse.unauthorizedResponse(res, 'You are not authorized to do this operation.');
                }
                // delete submission.
                Submission.findByIdAndRemove(req.params.id, (err) => {
                    if (err) {
                        return apiResponse.ErrorResponse(res, err);
                    }
                    return apiResponse.successResponse(res, 'Submission delete Success.');
                });
            });
        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];
