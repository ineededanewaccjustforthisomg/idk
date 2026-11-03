const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  gameTitle: { type: String, required: true },
  gameCoverPic: { type: String },
  visitorEnter: { type: Number, default: 0 },
  praiseNumber: { type: Number, default: 0 },
  gameTypes: { type: [String], default: [] },
  gameDetails: { type: String },
  bannerPic: { type: [String], default: [] },
  authorId: { type: String, required: true },
  featuredPlay: [
    {
      describe: { type: String },
      id: { type: Number },
      picUrl: { type: String }
    }
  ]
});

module.exports = mongoose.model('games', gameSchema);