const mongoose = require('mongoose');
const User = require('./user-model');

const friendSchema = new mongoose.Schema({
    userId: String,
    onlineStatus: Number,
    status: Number,
    friendFor: String,
    alias: String
});

friendSchema.statics.getRecommendation = async function (userId, number) {
    return await User.aggregate([
        { $match: { userId: { $ne: userId } } },
        { $sample: { size: number } },
        { $project: { _id: 0, userId: 1, gameId: { $literal: [] }, country: { $literal: '' } } }
    ]);
};

friendSchema.methods.setUserId = function(value) { this.userId = value; };
friendSchema.methods.setOnlineStatus = function(value) { this.onlineStatus = value; };
friendSchema.methods.setStatus = function(value) { this.status = value; };
friendSchema.methods.setFriendFor = function(value) { this.friendFor = value; };
friendSchema.methods.setAlias = function(value) { this.alias = value; };

friendSchema.methods.getUserId = function() { return this.userId; };
friendSchema.methods.getOnlineStatus = function() { return this.onlineStatus; };
friendSchema.methods.getStatus = function() { return this.status; };
friendSchema.methods.getFriendFor = function() { return this.friendFor; };
friendSchema.methods.getAlias = function() { return this.alias; };

friendSchema.methods.saveFriend = function() { 
    return this.save(); 
};

module.exports = mongoose.model('Friend', friendSchema);