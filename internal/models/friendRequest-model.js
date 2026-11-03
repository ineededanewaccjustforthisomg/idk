const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    requestId: String,
    userId: String,
    forId: String,
    msg: String,
    status: Number,
    sentFrom: String,
    sendDate: Date
});

friendRequestSchema.methods.setRequestId = function(value) {
    this.requestId = value;
};

friendRequestSchema.methods.setUserId = function(value) {
    this.userId = value;
};

friendRequestSchema.methods.setForId = function(value) {
    this.forId = value;
};

friendRequestSchema.methods.setMsg = function(value) {
    this.msg = value;
};

friendRequestSchema.methods.setSentFrom = function(value) {
    this.sentFrom = value;
};

friendRequestSchema.methods.setStatus = function(value) {
    this.status = value;
};

friendRequestSchema.methods.setSendDate = function(value) {
    this.sendDate = value;
};

friendRequestSchema.methods.getRequestId = function() {
    return this.requestId;
};

friendRequestSchema.methods.getUserId = function() {
    return this.userId;
};

friendRequestSchema.methods.getForId = function() {
    return this.forId;
};

friendRequestSchema.methods.getMsg = function() {
    return this.msg;
};

friendRequestSchema.methods.getSentFrom = function() {
    return this.sentFrom;
};

friendRequestSchema.methods.getSendDate = function() {
    return this.sendDate;
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;