const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Recharge = require('../models/Recharge');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            data: {
                users,
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

// @desc    Get pending add money requests
// @route   GET /api/admin/requests
// @access  Private/Admin
const getPendingRequests = async (req, res) => {
    try {
        const requests = await Transaction.find({ 
            type: 'add_money', 
            status: 'pending' 
        })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve add money request
// @route   PUT /api/admin/requests/:id/approve
// @access  Private/Admin
const approveRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('user')
            .session(session);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        // Update transaction
        transaction.status = 'approved';
        transaction.approvedBy = req.user.id;
        transaction.approvedAt = new Date();
        await transaction.save({ session });

        // Update user balance
        const user = await User.findById(transaction.user._id).session(session);
        user.balance += transaction.amount;
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Request approved successfully',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject add money request
// @route   PUT /api/admin/requests/:id/reject
// @access  Private/Admin
const rejectRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.findById(req.params.id).session(session);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        // Update transaction
        transaction.status = 'rejected';
        transaction.approvedBy = req.user.id;
        transaction.approvedAt = new Date();
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Request rejected successfully',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find()
            .populate('user', 'name email phone')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments();

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

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: user.isActive }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUsers,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getAllTransactions,
    toggleUserStatus
};