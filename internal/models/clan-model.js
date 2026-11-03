const mongoose = require('mongoose');
const clanConfig = require('../config/clan.json');

const clanDBSchema = new mongoose.Schema({
    clanId: Number,
    name: String,
    headPic: String,
    tags: Array,
    details: String,
    freeVerify: Number,
    notice: String,
    memberCount: Number,
    maxCount: Number,
    currentCount: Number,
    chiefId: Number,
    experience: {
        type: Number,
        default: 0,
        min: 0,
        set: function(value) {
            return Math.min(value, 50000000);
        }
    },
    level: Number,
    maxExperience: { type: Number, default: 1000 }
});

clanDBSchema.methods.setClanId = function(value) {
    this.clanId = value;
};

clanDBSchema.methods.setName = function(value) {
    this.name = value;
};

clanDBSchema.methods.setHeadPic = function(value) {
    this.headPic = value;
};

clanDBSchema.methods.setTags = function(value) {
    this.tags = value;
};

clanDBSchema.methods.setDetails = function(value) {
    this.details = value;
};

clanDBSchema.methods.setFreeVerify = function(value) {
    this.freeVerify = value;
};

clanDBSchema.methods.setNotice = function(value) {
    this.notice = value;
};

clanDBSchema.methods.setMemberCount = function(value) {
    this.memberCount = value;
};

clanDBSchema.methods.setMaxCount = function(value) {
    this.maxCount = value;
};

clanDBSchema.methods.setCurrentCount = function(value) {
    this.currentCount = value;
};

clanDBSchema.methods.setChiefId = function(value) {
    this.chiefId = value;
};

clanDBSchema.methods.setExperience = function(value) {
    this.experience = value;
};

clanDBSchema.methods.setLevel = function(value) {
    this.level = value;
};

clanDBSchema.methods.setMaxExperience = function(value) {
    this.maxExperience = value;
};

clanDBSchema.methods.getClanId = function() {
    return this.clanId;
};

clanDBSchema.methods.getName = function() {
    return this.name;
};

clanDBSchema.methods.getHeadPic = function() {
    return this.headPic;
};

clanDBSchema.methods.getTags = function() {
    return this.tags;
};

clanDBSchema.methods.getDetails = function() {
    return this.details;
};

clanDBSchema.methods.getFreeVerify = function() {
    return this.freeVerify;
};

clanDBSchema.methods.getNotice = function() {
    return this.notice;
};

clanDBSchema.methods.getMemberCount = function() {
    return this.memberCount;
};

clanDBSchema.methods.getMaxCount = function() {
    return this.maxCount;
};

clanDBSchema.methods.getCurrentCount = function() {
    return this.currentCount;
};

clanDBSchema.methods.getChiefId = function() {
    return this.chiefId;
};

clanDBSchema.methods.getExperience = function() {
    return this.experience;
};

clanDBSchema.methods.getLevel = function() {
    return this.level;
};

clanDBSchema.methods.getMaxExperience = function() {
    return this.maxExperience;
};

clanDBSchema.methods.response = function() {
    return {
        clanId: this.clanId,
        name: this.name,
        headPic: this.headPic,
        tags: this.tags,
        details: this.details,
        experience: this.experience,
        level: this.level,
        freeVerify: this.freeVerify,
        currentCount: this.currentCount,
        maxCount: this.maxCount
    };
};

clanDBSchema.methods.addExperience = async function(experience) {
    this.experience += experience;

    const clanLevelConfig = clanConfig.levels[this.level];
    if (clanLevelConfig && clanLevelConfig.upgradeExperience != null && this.experience >= clanLevelConfig.upgradeExperience) {
        this.level += 1;
        if (this.level > 9) {
            this.level = 9;
        } else {
            this.experience -= clanLevelConfig.upgradeExperience;
        }
    }

    await this.save();
};

module.exports = mongoose.model('Clans', clanDBSchema);