const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mobileNumber: {
        type: String,
        required: true,
        match: /^01[3-9]\d{8}$/
    },
    operator: {
        type: String,
        required: true,
        enum: ['gp', 'robl', 'airtel', 'teletalk', 'banglink']
    },
    amount: {
        type: Number,
        required: true,
        min: 10,
        max: 1000
    },
    beforeBalance: {
        type: Number,
        required: true
    },
    afterBalance: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    transactionId: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique transaction ID
rechargeSchema.pre('save', async function(next) {
    if (!this.transactionId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.transactionId = `RCH${timestamp}${random}`;
    }
    next();
});

module.exports = mongoose.model('Recharge', rechargeSchema);