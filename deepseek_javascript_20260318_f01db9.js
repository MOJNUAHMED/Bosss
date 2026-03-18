const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getDashboard,
    getBalance,
    getTransactions,
    getRecharges
} = require('../controllers/userController');

router.use(protect); // All routes require authentication

router.get('/dashboard', getDashboard);
router.get('/