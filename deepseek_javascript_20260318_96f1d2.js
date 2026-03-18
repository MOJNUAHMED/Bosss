const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Recharge = require('../models/Recharge');
const mongoose = require('mongoose');

// @desc    Create add money request
// @route   POST /api/recharge/add-money
// @access  Private
const addMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, method, transactionId } = req.body;

        // Validation
        if (amount < 10 || amount > 50000) {
            return res.status(400).json({ message: 'Amount must be between 10 and 50000' });
        }

        // Check if transaction ID already exists
        const existingTransaction = await Transaction.findOne({ transactionId });
        if (existingTransaction) {
            return res.status(400).json({ message: 'Transaction ID already used' });
        }

        // Create transaction request
        const transaction = await Transaction.create([{
            user: req.user.id,
            amount,
            type: 'add_money',
            method,
            transactionId,
            status: 'pending'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Add money request submitted successfully',
            data: transaction[0]
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Process mobile recharge
// @route   POST /api/recharge/mobile
// @access  Private
const mobileRecharge = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { mobileNumber, operator, amount } = req.body;

        // Validation
        if (amount < 10 || amount > 1000) {
            return res.status(400).json({ message: 'Recharge amount must be between 10 and 1000' });
        }

        // Check mobile number format (Bangladesh)
        const mobileRegex = /^01[3-9]\d{8}$/;
        if (!mobileRegex.test(mobileNumber)) {
            return res.status(400).json({ message: 'Invalid Bangladeshi mobile number' });
        }

        // Get user with balance check
        const user = await User.findById(req.user.id).session(session);
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Process recharge
        const beforeBalance = user.balance;
        const afterBalance = beforeBalance - amount;

        // Update user balance
        user.balance = afterBalance;
        await user.save({ session });

        // Create recharge record
        const recharge = await Recharge.create([{
            user: req.user.id,
            mobileNumber,
            operator,
            amount,
            beforeBalance,
            afterBalance,
            status: 'success'
        }], { session });

        // Create transaction record
        await Transaction.create([{
            user: req.user.id,
            amount,
            type: 'recharge',
            operator,
            mobileNumber,
            status: 'approved',
            description: `Mobile recharge for ${mobileNumber}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Recharge successful',
            data: {
                recharge: recharge[0],
                newBalance: afterBalance
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get operator rates
// @route   GET /api/recharge/rates
// @access  Private
const getRates = async (req, res) => {
    try {
        const rates = {
            gp: { name: 'Grameenphone', discount: 0, min: 10, max: 1000 },
            robl: { name: 'Robi', discount: 0, min: 10, max: 1000 },
            airtel: { name: 'Airtel', discount: 0, min: 10, max: 1000 },
            teletalk: { name: 'Teletalk', discount: 5, min: 10, max: 500 },
            banglink: { name: 'Banglalink', discount: 0, min: 10, max: 1000 }
        };

        res.json({
            success: true,
            data: rates
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addMoney,
    mobileRecharge,
    getRates
};