const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: String,
    currency: Number,
    created: Date,
    inoutType: Number,
    orderId: String,
    qty: Number,
    status: Number,
    transactionType: Number
});

module.exports = mongoose.model('Transaction', transactionSchema);