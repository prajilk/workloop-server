const { serverError } = require('../lib/utils');
const Notification = require("../models/Notification");

module.exports = {
    getNotifications: async (req, res) => {
        try {
            const userId = req.user;
            const notifications = await Notification.find({ userId });
            res.status(200).json(notifications.reverse())
        } catch (error) {
            serverError(error, res)
        }
    },
    updateNotificationStatus: async (req, res) => {
        try {
            const { notificationId } = req.body;
            const updatedNotification = await Notification.findByIdAndUpdate({ _id: notificationId }, { read: true });
            res.status(200).json(updatedNotification)
        } catch (error) {
            serverError(error, res)
        }
    },
    deleteNotification: async (req, res) => {
        try {
            const { notificationId } = req.query;
            const deletedNotification = await Notification.findByIdAndDelete({ _id: notificationId });
            res.status(200).json(deletedNotification)
        } catch (error) {
            serverError(error, res)
        }
    },
    deleteAllNotifications: async (req, res) => {
        try {
            const userId = req.user;
            const result = await Notification.deleteMany({ userId });
            console.log(result);
            res.status(200).json(result)
        } catch (error) {
            serverError(error, res)
        }
    }
}