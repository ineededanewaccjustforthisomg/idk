const mongoose = require('mongoose');

const tribeMembersSchema = new mongoose.Schema({
  userId: String,
  clanId: Number,
  clanRole: Number,
  currentGold: { type: Number, default: 0 },
  currentDiamond: { type: Number, default: 0 },
  experience: Number,
  lastDonationDate: { type: Date }
});

tribeMembersSchema.methods.setUserId = function(value) {
  this.userId = value;
};

tribeMembersSchema.methods.setClanId = function(value) {
  this.clanId = value;
};

tribeMembersSchema.methods.setClanRole = function(value) {
  this.clanRole = value;
};

tribeMembersSchema.methods.setCurrentGold = function(value) {
  this.currentGold = value;
};

tribeMembersSchema.methods.setCurrentDiamond = function(value) {
  this.currentDiamond = value;
};

tribeMembersSchema.methods.setExperience = function(value) {
  this.experience = value;
};

tribeMembersSchema.methods.setLastDonationDate = function(value) {
  this.lastDonationDate = value;
};

tribeMembersSchema.methods.getUserId = function() {
  return this.userId;
};

tribeMembersSchema.methods.getClanId = function() {
  return this.clanId;
};

tribeMembersSchema.methods.getClanRole = function() {
  return this.clanRole;
};

tribeMembersSchema.methods.getCurrentGold = function() {
  return this.currentGold;
};

tribeMembersSchema.methods.getCurrentDiamond = function() {
  return this.currentDiamond;
};

tribeMembersSchema.methods.getExperience = function() {
  return this.experience;
};

tribeMembersSchema.methods.getLastDonationDate = function() {
  return this.lastDonationDate;
};

module.exports = mongoose.model('TribeMember', tribeMembersSchema);