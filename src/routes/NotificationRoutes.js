const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { getNotifications, updateNotificationStatus, deleteNotification, deleteAllNotifications } = require('../controllers/NotificationController');
const router = express.Router();

router.get('/', verifyToken, getNotifications)
router.delete('/', verifyToken, deleteNotification)
router.delete('/all', verifyToken, deleteAllNotifications)
router.patch('/status', verifyToken, updateNotificationStatus)

module.exports = router;