const express = require('express');
const MatchController = require('../controllers/MatchController');

const router = express.Router();

router.get('/:id', MatchController.matchList);

module.exports = router;
