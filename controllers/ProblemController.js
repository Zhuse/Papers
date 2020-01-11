const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Problem = require('../models/ProblemModel');
const Match = require('../models/MatchModel');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');

mongoose.set('useFindAndModify', false);

// Problem Schema
function ProblemData(data) {
    this.stdinTest = data.stdinTest;
    this.description = data.description;
    this.parExec = data.parExec;
    this.parMem = data.parMem;
    this.expectedStdout = data.expectedStdout;
}

/**
 * Problem List.
 *
 * @returns {Object}
 */
exports.problemList = [
    auth,
    function (req, res) {
        try {
            Problem.find({ user: req.user._id }).then((problems) => {
                if (problems.length > 0) {
                    return apiResponse.successResponseWithData(res, 'Operation success', problems);
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
 * Problem Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.problemDetail = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, 'Operation success', {});
        }
        try {
            Problem.findOne({ _id: req.params.id, user: req.user._id }).then((problem) => {
                if (problem !== null) {
                    const problemData = new ProblemData(problem);
                    return apiResponse.successResponseWithData(res, 'Operation success', problemData);
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
 * Get random problem
 *
 *
 * @returns {Object}
 */
exports.getRandomProblem = async function () {
    return await Problem.findOne()
}

/**
 * Problem store.
 *
 * @param {string}      stdinTest
 * @param {string}      description
 * @param {string}      parExec
 * @param {string}      parMem
 * @param {string}      expectedStdout
 * @returns {Object}
 */
exports.problemStore = [
    auth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new Error('Something wrong happened. Please try again later.');
            }
            const problem = new Problem(
                {
                    stdinTest: req.body.stdinTest,
                    description: req.body.description,
                    parExec: req.body.parExec,
                    parMem: req.body.parMem,
                    expectedStdout: req.body.expectedStdout
                }
            );

            // Save problem.
            problem.save((err) => {
                if (err) { return apiResponse.ErrorResponse(res, err); }
                const problemData = new ProblemData(problem);
                return apiResponse.successResponseWithData(res, 'Problem add Success.', problemData);
            });
        } catch (err) {
            console.log(err)
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

/**
 * Problem Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.problemDelete = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid ID');
        }
        try {
            Problem.findById(req.params.id, (err, foundProblem) => {
                if (foundProblem === null) {
                    return apiResponse.notFoundResponse(res, 'Problem not exists with this id');
                }
                // Check authorized user
                if (foundProblem.user.toString() !== req.user._id) {
                    return apiResponse.unauthorizedResponse(res, 'You are not authorized to do this operation.');
                }
                // delete problem.
                Problem.findByIdAndRemove(req.params.id, (err) => {
                    if (err) {
                        return apiResponse.ErrorResponse(res, err);
                    }
                    return apiResponse.successResponse(res, 'Problem delete Success.');
                });
            });
        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];
