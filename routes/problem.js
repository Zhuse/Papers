const express = require('express');
const ProblemController = require('../controllers/ProblemController');

const router = express.Router();

router.get('/', ProblemController.problemList);
router.get('/:id', ProblemController.problemDetail);
router.post('/', ProblemController.problemStore);
router.delete('/:id', ProblemController.problemDelete);

module.exports = router;
