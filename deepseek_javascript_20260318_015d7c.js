const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    addMoney,
    mobileRecharge,
    getRates
} = require('../controllers/rechargeController');

router.use(protect); // All routes require authentication

// Add money validation
const addMoneyValidation = [
    body('amount').isInt({ min: 10, max: 50000 }).withMessage('Amount must be between 10 and 50000'),
    body('method').isIn(['bkash', 'nagad', 'rocket', 'bank']).withMessage('Invalid payment method'),
    body('transactionId').notEmpty().withMessage('Transaction ID is required')
];

// Recharge validation
const rechargeValidation = [
    body('mobileNumber').matches(/^01[3-9]\d{8}$/).withMessage('Invalid Bangladeshi mobile number'),
    body('operator').isIn(['gp', 'robl', 'airtel', 'teletalk', 'banglink']).withMessage('Invalid operator'),
    body('amount').isInt({ min: 10, max: 1000 }).withMessage('Amount must be between 10 and 1000')
];

router.post('/add-money', addMoneyValidation, addMoney);
router.post('/mobile', rechargeValidation, mobileRecharge);
router.get('/rates', getRates);

module.exports = router;