const express = require('express');
const SubmissionController = require('../controllers/SubmissionController');

const router = express.Router();

router.get('/', SubmissionController.submissionList);
router.get('/:id', SubmissionController.submissionDetail);
router.post('/', SubmissionController.submissionStore);
router.delete('/:id', SubmissionController.submissionDelete);

module.exports = router;
