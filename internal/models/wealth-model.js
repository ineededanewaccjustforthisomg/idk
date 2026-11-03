const mongoose = require('mongoose');

const wealthSchema = new mongoose.Schema({
    userId: String,
    clanGold: Number,
    diamonds: Number,
    gold: Number
});

module.exports = mongoose.model('Wealth', wealthSchema);