const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: String,
    accessToken: String,
    password: String,
    creationTime: Date,
    lastSeen: { type: Date, default: Date.now },
    email: String
});

module.exports = mongoose.model('Account', accountSchema);