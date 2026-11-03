const mongoose = require('mongoose');

const localeSchema = new mongoose.Schema({
    userId: String,
    language: String
});

module.exports = mongoose.model('Locale', localeSchema, 'userlocale');