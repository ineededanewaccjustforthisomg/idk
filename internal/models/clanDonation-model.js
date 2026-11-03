const mongoose = require('mongoose');

const TribeMember = require('./clanMember-model');
const Vip = require('./vip-model');
const ClanDB = require('./clan-model');
const clanConfig = require('../config/clan.json');

const tribeDonationSchema = new mongoose.Schema({
    userId: Number,
    nickName: String,
    clanId: Number,
    type: Number,
    quantity: Number,
    tribeCurrencyGot: Number,
    experienceGot: Number,
    date: Number
});

tribeDonationSchema.methods.setUserId = function(value) {
    this.userId = value;
};

tribeDonationSchema.methods.setNickname = function(value) {
    this.nickName = value;
};

tribeDonationSchema.methods.setClanId = function(value) {
    this.clanId = value;
};

tribeDonationSchema.methods.setType = function(value) {
    this.type = value;
};

tribeDonationSchema.methods.setQuantity = function(value) {
    this.quantity = value;
};

tribeDonationSchema.methods.setTribeCurrencyGot = function(value) {
    this.tribeCurrencyGot = value;
};

tribeDonationSchema.methods.setExperienceGot = function(value) {
    this.experienceGot = value;
};

tribeDonationSchema.methods.setDate = function(value) {
    this.date = value;
};

tribeDonationSchema.methods.getUserId = function() {
    return this.userId;
};

tribeDonationSchema.methods.getNickName = function() {
    return this.nickName;
};

tribeDonationSchema.methods.getClanId = function() {
    return this.clanId;
};

tribeDonationSchema.methods.getType = function() {
    return this.type;
};

tribeDonationSchema.methods.getQuantity = function() {
    return this.quantity;
};

tribeDonationSchema.methods.getTribeCurrencyGot = function() {
    return this.tribeCurrencyGot;
};

tribeDonationSchema.methods.getExperienceGot = function() {
    return this.experienceGot;
};

tribeDonationSchema.methods.getDate = function() {
    return this.date;
};

tribeDonationSchema.methods.getInfo = async function(userId) {
    if (this.clanId == 0) {
        return { message: "User is not in a clan." };
    }

    const tribeMember = await TribeMember.findOne({ userId: userId });
    if (!tribeMember) {
        return { message: "User is not a member of the clan." };
    }

    const vip = await Vip.findOne({ userId: userId });
    const clan = await ClanDB.findOne({ clanId: tribeMember.clanId });
    const clanLevelConfig = clanConfig.levels[clan.level];

    const currentGold = tribeMember.currentGold ?? 0;
    const currentDiamonds = tribeMember.currentDiamond ?? 0;
    const currentTasks = 0;

    return {
        currentGold: currentGold,
        currentDiamond: currentDiamonds,
        currentTask: currentTasks,
        currentExperience: clan.experience,
        clanId: clan.clanId,
        level: clan.level,
        maxDiamond: clanLevelConfig.maxDiamondDonate * clanConfig.vipBoosts[vip.getLevel()].maxDiamondDonate,
        maxExperience: clanLevelConfig.upgradeExperience,
        maxGold: clanLevelConfig.maxGoldDonate * clanConfig.vipBoosts[vip.getLevel()].maxGoldDonate,
        maxTask: clanLevelConfig.personalTaskCount + clanLevelConfig.clanTaskCount
    };
};

module.exports = mongoose.model('TribeDonation', tribeDonationSchema);