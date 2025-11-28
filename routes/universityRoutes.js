const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getUniversities,
    getUniversity,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    toggleStatus
} = require('../controllers/universityController');

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.route('/')
    .get(getUniversities)
    .post(createUniversity);

router.route('/:id')
    .get(getUniversity)
    .put(updateUniversity)
    .delete(deleteUniversity);

router.put('/:id/toggle', toggleStatus);

module.exports = router;