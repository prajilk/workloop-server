const { Schema, model, models } = require('mongoose');

const portfolioSchema = new Schema({
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
    skills: [Schema.Types.Mixed],
    links: [String],
    images: [{
        url: String
    }],
    workId: Schema.Types.ObjectId
}, { versionKey: false, timestamps: true })

module.exports = models.Portfolio || model('Portfolio', portfolioSchema);