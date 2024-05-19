const { Schema, model, models } = require('mongoose');

const proposalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    workId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    charge: {
        type: Number,
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    }
}, { versionKey: false, timestamps: true })

module.exports = models.Proposal || model('Proposal', proposalSchema);