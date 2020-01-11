const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');
const httpHelpers = require('../helpers/httpHelpers');

mongoose.set('useFindAndModify', false);
/**
 * Execution store.
 *
 * @param {string}      source_code
 * @param {string}      language_id
 * @param {string}      stdin
 * @param {string}      user
 * @param {string}      match
 * @returns {Object}
 */
exports.execute = [
    auth,
    body('language_id', 'Must choose a language').custom((value) => {
        if (value >= 1 || value <= 44) {
            return true;
        }
        throw new Error('Invalid Language');
    }),
    body('user', 'User must not be empty').isLength({ min: 1 }).trim(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new Error('Something wrong happened. Please try again later.');
            }
            const execResult = await httpHelpers.post('/submissions', {
                source_code: req.body.source_code,
                language_id: req.body.language_id,
                stdin: req.body.stdin,
            })
            return apiResponse.successResponseWithData(res, 'Execution Success.', execResult);

        } catch (err) {
            // throw error in json response with status 500.
            return apiResponse.ErrorResponse(res, err);
        }
    },
];
