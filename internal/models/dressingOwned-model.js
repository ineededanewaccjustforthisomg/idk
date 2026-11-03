const mongoose = require('mongoose');

const dressingOwnedSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    owned: {
        type: [String],
        required: true,
        default: []
    }
});

module.exports = mongoose.model('dressingOwned', dressingOwnedSchema);