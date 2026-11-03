const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    configName: { type: String, required: true, unique: true },
    configData: { type: mongoose.Schema.Types.Mixed, required: true }
});

module.exports = mongoose.model('config', configSchema);