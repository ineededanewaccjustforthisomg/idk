const mongoose = require("mongoose");
const { Schema } = mongoose;

const userDataSchema = new Schema({
    userId: { type: Number, required: true, index: true },
    subKey: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
});

userDataSchema.index({ userId: 1, subKey: 1 }, { unique: true });

module.exports = mongoose.model("UserData", userDataSchema);