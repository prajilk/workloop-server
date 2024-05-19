const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { createApplication, getApplicationById } = require('../controllers/ApplicationController');
const router = express.Router();

router.post('/', verifyToken, createApplication)
router.get('/:jobId', verifyToken, getApplicationById)

module.exports = router;