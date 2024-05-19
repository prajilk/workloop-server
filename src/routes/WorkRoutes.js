const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { createWork, getWorks, getWorkById, getWorksByUserId, updateWorkStatus, deleteWork, searchWorks } = require('../controllers/WorkController');
const getUserId = require('../middleware/getUserId');
const router = express.Router();

router.post('/', verifyToken, createWork)
router.get('/', getWorks)
router.get('/:workId', getUserId, getWorkById)
router.delete('/:workId', verifyToken, deleteWork)
router.patch('/status', verifyToken, updateWorkStatus)
router.post('/search', searchWorks)
router.get('/user/:userId', verifyToken, getWorksByUserId)

module.exports = router;