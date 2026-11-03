const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameLogSchema = new Schema({
    userId: { type: Number, required: true, index: true },
    serverInfo: { type: Schema.Types.Mixed, required: true },
    gameType: { type: String, required: true },
    dataAction: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameLog", gameLogSchema);