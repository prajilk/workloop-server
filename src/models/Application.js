const { Schema, model, models } = require('mongoose');

const applicationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    jobId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    }
}, { versionKey: false, timestamps: true })

module.exports = models.Application || model('Application', applicationSchema);