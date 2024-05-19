const { Schema, model, models } = require('mongoose');

const bookmarkSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    jobId: Schema.Types.ObjectId,
    workId: Schema.Types.ObjectId
}, { versionKey: false })

module.exports = models.Bookmark || model('Bookmark', bookmarkSchema);