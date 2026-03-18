const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    type: {
        type: String,
        enum: ['add_money', 'recharge', 'withdraw'],
        required: true
    },
    method: {
        type: String,
        enum: ['bkash', 'nagad', 'rocket', 'bank'],
        required: function() {
            return this.type === 'add_money';
        }
    },
    transactionId: {
        type: String,
        required: function() {
            return this.type === 'add_money';
        },
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    operator: {
        type: String,
        enum: ['gp', 'robl', 'airtel', 'teletalk', 'banglink'],
        required: function() {
            return this.type === 'recharge';
        }
    },
    mobileNumber: {
        type: String,
        required: function() {
            return this.type === 'recharge';
        }
    },
    description: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);