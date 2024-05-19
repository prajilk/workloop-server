const { Schema, model, models } = require('mongoose');

const socialsSchema = new Schema({
    userId: Schema.Types.ObjectId,
    linkedIn: String,
    github: String,
    x: String,
    stackOverflow: String,
    website: String,
    dribbble: String
}, { versionKey: false });

module.exports = models.Socials || model('Socials', socialsSchema);