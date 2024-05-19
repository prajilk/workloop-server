const { Schema, model, models } = require('mongoose');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: String,
    country: String
}, { versionKey: false, timestamps: true })

module.exports = models.User || model('User', userSchema);