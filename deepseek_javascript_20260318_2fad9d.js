const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Recharge = require('../models/Recharge');

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
const getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        // Get recent transactions
        const recentTransactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent recharges
        const recentRecharges = await Recharge.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                user,
                recentTransactions,
                recentRecharges
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user balance
// @route   GET /api/user/balance
// @access  Private
const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('balance');
        res.json({
            success: true,
            balance: user.balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user transaction history
// @route   GET /api/user/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments({ user: req.user.id });

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user recharge history
// @route   GET /api/user/recharges
// @access  Private
const getRecharges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const recharges = await Recharge.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Recharge.countDocuments({ user: req.user.id });

        res.json({
            success: true,
            data: {
                recharges,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboard,
    getBalance,
    getTransactions,
    getRecharges
};