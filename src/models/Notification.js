const { Schema, model, models } = require('mongoose');

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    notification: {
        type: String,
        required: true
    },
    url: String,
    read: {
        type: Boolean,
        required: true,
        default: false
    }
}, { versionKey: false, timestamps: true })

module.exports = models.Notification || model('Notification', notificationSchema);