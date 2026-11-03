const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: String,
    freeWheel: Number,
    moneyClaimed: Boolean,
    luckDiamonds: Number,
    luckGold: Number,
    blockDiamonds: Number,
    blockGold: Number,
    signInDay: Number,
    currentSignInDay: Number
});

module.exports = mongoose.model('Activity', activitySchema);