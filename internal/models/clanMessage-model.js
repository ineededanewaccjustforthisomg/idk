const mongoose = require('mongoose');

const tribeMessageSchema = new mongoose.Schema({
    id: Number,
    clanId: Number,
    headPic: String,
    userId: Number,
    nickName: String,
    type: Number,
    status: Number,
    msg: String,
    forId: Number,
    sentDate: { type: Date, default: Date.now }
});

tribeMessageSchema.methods.setId = function(value) {
    this.id = value;
};

tribeMessageSchema.methods.setClanId = function(value) {
    this.clanId = value;
};

tribeMessageSchema.methods.setHeadPic = function(value) {
    this.headPic = value;
};

tribeMessageSchema.methods.setUserId = function(value) {
    this.userId = value;
};

tribeMessageSchema.methods.setNickname = function(value) {
    this.nickName = value;
};

tribeMessageSchema.methods.setType = function(value) {
    this.type = value;
};

tribeMessageSchema.methods.setStatus = function(value) {
    this.status = value;
};

tribeMessageSchema.methods.setMsg = function(value) {
    this.msg = value;
};

tribeMessageSchema.methods.setForId = function(value) {
    this.forId = value;
};

tribeMessageSchema.methods.setSentDate = function(value) {
    this.sentDate = value;
};

tribeMessageSchema.methods.getId = function() {
    return this.id;
};

tribeMessageSchema.methods.getClanId = function() {
    return this.clanId;
};

tribeMessageSchema.methods.getHeadPic = function() {
    return this.headPic;
};

tribeMessageSchema.methods.getUserId = function() {
    return this.userId;
};

tribeMessageSchema.methods.getNickname = function() {
    return this.nickName;
};

tribeMessageSchema.methods.getType = function() {
    return this.type;
};

tribeMessageSchema.methods.getStatus = function() {
    return this.status;
};

tribeMessageSchema.methods.getMsg = function() {
    return this.msg;
};

tribeMessageSchema.methods.getForId = function() {
    return this.forId;
};

tribeMessageSchema.methods.getSentDate = function() {
    return this.sentDate;
};

module.exports = mongoose.model('TribeMessage', tribeMessageSchema);