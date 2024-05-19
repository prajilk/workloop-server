const { Schema, model, models } = require('mongoose');

const profileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    role: String,
    experience: String,
    hourly: Number,
    lookingForWork: Boolean,
    topFourSocials: [{ type: String }],
    about: String,
    skills: [Schema.Types.Mixed],
    languages: [Schema.Types.Mixed],
    education: [{
        school: String,
        degree: String,
        startYear: String,
        endYear: String
    }]
}, { versionKey: false });

module.exports = models.Profile || model('Profile', profileSchema);