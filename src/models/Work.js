const { Schema, model, models } = require('mongoose');

const workSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    paymentMin: {
        type: Number,
        required: true
    },
    paymentMax: {
        type: Number,
        required: true
    },
    closed: {
        type: Boolean,
        required: true,
        default: false
    },
    experience: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    totalApplicants: {
        type: Number,
        required: true,
        default: 0
    },
    skills: [Schema.Types.Mixed]
}, { versionKey: false, timestamps: true })

module.exports = models.Work || model('Work', workSchema);