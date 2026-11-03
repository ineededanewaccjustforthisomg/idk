const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Number, default: 2 },
    type: { type: Number, default: 0 },
    attachment: [
        {
            status: { type: Number, required: true },
            type: { type: Number, required: true },
            itemId: { type: String, required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            icon: { type: String, required: true },
            dressId: { type: Number, required: false }
        }
    ],
    extra: String,
    sendDate: { type: Date, default: Date.now },
    userId: String
});

mailSchema.methods.response = function () {
    return {
        id: this.id,
        title: this.title,
        content: this.description,
        sendDate: this.sendDate.getTime(),
        status: this.status,
        type: this.type,
        attachment: this.attachment || null,
        extra: this.extra
    };
};

module.exports = mongoose.model('Mail', mailSchema);