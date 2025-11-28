const University = require('../models/University');
const Program = require('../models/Program');

// @desc    Get all universities (Admin)
// @route   GET /api/admin/universities
// @access  Private
const getUniversities = async (req, res) => {
    try {
        const universities = await University.find()
            .sort({ createdAt: -1 });
        res.json(universities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single university
// @route   GET /api/admin/universities/:id
// @access  Private
const getUniversity = async (req, res) => {
    try {
        const university = await University.findById(req.params.id);
        
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }
        
        res.json(university);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create university
// @route   POST /api/admin/universities
// @access  Private
const createUniversity = async (req, res) => {
    try {
        const university = await University.create(req.body);
        res.status(201).json(university);
    } catch (error) {
        console.error('Create University Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update university
// @route   PUT /api/admin/universities/:id
// @access  Private
const updateUniversity = async (req, res) => {
    try {
        const university = await University.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.json(university);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete university
// @route   DELETE /api/admin/universities/:id
// @access  Private
const deleteUniversity = async (req, res) => {
    try {
        const university = await University.findById(req.params.id);

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        // Delete associated programs
        await Program.deleteMany({ universityId: req.params.id });
        
        await university.deleteOne();

        res.json({ message: 'University deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle university status
// @route   PUT /api/admin/universities/:id/toggle
// @access  Private
const toggleStatus = async (req, res) => {
    try {
        const university = await University.findById(req.params.id);

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        university.isActive = !university.isActive;
        await university.save();

        res.json(university);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all functions
module.exports = {
    getUniversities,
    getUniversity,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    toggleStatus
};