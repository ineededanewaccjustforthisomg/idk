const mongoose = require('mongoose');

const dressingEquippedSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false
    },
    avatarId: {
        type: String,
        required: false
    },
    avatarTypeId: {
        type: String,
        required: false
    },
    avatarCamera: {
        type: String,
        required: false
    },
    avatarName: {
        type: String,
        required: false
    },
    avatarIconUrl: {
        type: String,
        required: false
    },
    avatarResourceId: {
        type: String,
        required: false
    },
    avatarDetails: {
        type: String,
        required: false
    },
    avatarPrice: {
        type: Number,
        required: false
    },
     avatarCurrency: {
        type: Number,
        required: false
    },
    status: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('dressingEquipped', dressingEquippedSchema);