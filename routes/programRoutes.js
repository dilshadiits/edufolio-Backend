const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleStatus
} = require('../controllers/programController');

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.route('/')
    .get(getPrograms)
    .post(createProgram);

router.route('/:id')
    .get(getProgram)
    .put(updateProgram)
    .delete(deleteProgram);

router.put('/:id/toggle', toggleStatus);

module.exports = router;