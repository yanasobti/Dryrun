const express = require('express');
const router = express.Router();
const runController = require('../controllers/runController');

router.post('/run', runController.runCode);
router.post('/visualize', runController.visualizeCode);

module.exports = router;
