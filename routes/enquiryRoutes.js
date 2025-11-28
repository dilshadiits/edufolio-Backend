const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getEnquiries,
    getEnquiry,
    updateEnquiry,
    deleteEnquiry,
    updateStatus
} = require('../controllers/enquiryController');

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.route('/')
    .get(getEnquiries);

router.route('/:id')
    .get(getEnquiry)
    .put(updateEnquiry)
    .delete(deleteEnquiry);

router.put('/:id/status', updateStatus);

module.exports = router;