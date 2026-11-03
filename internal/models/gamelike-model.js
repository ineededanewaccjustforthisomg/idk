const mongoose = require('mongoose');

const gameLike = new mongoose.Schema({
  gameId: { type: String, required: true },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('gamelikes', gameLike);