const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { createJob, getJobs, getJobById, getJobsByUserId, deleteJob, updateJobStatus, searchJobs } = require('../controllers/JobController');
const getUserId = require('../middleware/getUserId');
const router = express.Router();

router.post('/', verifyToken, createJob)
router.get('/', getJobs)
router.get('/:jobId', getUserId, getJobById)
router.delete('/:jobId', verifyToken, deleteJob)
router.patch('/status', verifyToken, updateJobStatus)
router.post('/search', searchJobs)
router.get('/user/:userId', verifyToken, getJobsByUserId)

module.exports = router;