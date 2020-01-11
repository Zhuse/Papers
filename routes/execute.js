const express = require('express');
const ExecuteController = require('../controllers/ExecuteController');

const router = express.Router();

router.post('/', ExecuteController.execute);

module.exports = router;
