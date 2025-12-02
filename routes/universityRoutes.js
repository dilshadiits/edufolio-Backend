const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getUniversities,
    getUniversity,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    toggleStatus,
    toggleFeatured
} = require('../controllers/universityController');

// Apply protect middleware to all routes
router.use(protect);

// CRUD Routes
router.route('/')
    .get(getUniversities)
    .post(createUniversity);

router.route('/:id')
    .get(getUniversity)
    .put(updateUniversity)
    .delete(deleteUniversity);

// Toggle Routes
router.put('/:id/toggle', toggleStatus);
router.put('/:id/featured', toggleFeatured);

module.exports = router;
