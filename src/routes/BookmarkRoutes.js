const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { getBookmarks, updateBookmark, getBookmarkedJobs, getBookmarkedWorks } = require('../controllers/BookmarkController');
const router = express.Router();

router.get('/', verifyToken, getBookmarks)
router.post('/', verifyToken, updateBookmark)
router.get('/jobs', verifyToken, getBookmarkedJobs)
router.get('/works', verifyToken, getBookmarkedWorks)

module.exports = router;