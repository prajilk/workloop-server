const { Schema, model, models } = require('mongoose');

const jobSchema = new Schema({
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
    company: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    closed: {
        type: Boolean,
        require: true,
        default: false
    },
    totalApplicants: {
        type: Number,
        required: true,
        default: 0
    },
    skills: [Schema.Types.Mixed]
}, { versionKey: false, timestamps: true })

module.exports = models.Job || model('Job', jobSchema);