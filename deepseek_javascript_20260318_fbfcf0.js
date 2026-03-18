const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
    getUsers,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getAllTransactions,
    toggleUserStatus
} = require('../controllers/adminController');

router.use(protect, admin); // All routes require admin authentication

router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/requests', getPendingRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);
router.get('/transactions', getAllTransactions);

module.exports = router;