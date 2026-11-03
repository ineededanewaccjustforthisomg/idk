const mongoose = require('mongoose');

const vipSchema = new mongoose.Schema({
    userId: String,
    vip: Number,
    expireDate: Date,
    lastClaimedReward: Date
});

vipSchema.methods.setUserId = function(value) {
    this.userId = value;
};

vipSchema.methods.setVip = function(value) {
    this.vip = value;
};

vipSchema.methods.setExpireDate = function(value) {
    this.expireDate = value;
};

vipSchema.methods.setLastClaimedReward = function(value) {
    this.lastClaimedReward = value;
};

vipSchema.methods.getUserId = function() {
    return this.userId;
};

vipSchema.methods.getLevel = function() {
    return this.vip;
};

vipSchema.methods.getExpireDate = function() {
    return this.expireDate;
};

vipSchema.methods.getLastClaimedReward = function() {
    return this.lastClaimedReward;
};

module.exports = mongoose.model('Vip', vipSchema);