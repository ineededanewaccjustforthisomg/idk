const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nickname: String,
    userId: String,
    birthday: String,
    introduction: String,
    sex: Number,
    picUrl: String,
    isFreeNickname: Boolean,
    stopReason: String,
    stopToTime: String,
    status: Number
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);