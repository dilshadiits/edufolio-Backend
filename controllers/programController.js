const Program = require('../models/Program');
const University = require('../models/University');

// @desc    Get all programs (Admin)
// @route   GET /api/admin/programs
// @access  Private
const getPrograms = async (req, res) => {
    try {
        const programs = await Program.find()
            .populate('universityId', 'name logo')
            .sort({ createdAt: -1 });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single program
// @route   GET /api/admin/programs/:id
// @access  Private
const getProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id)
            .populate('universityId', 'name logo location');
        
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }
        
        res.json(program);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create program
// @route   POST /api/admin/programs
// @access  Private
const createProgram = async (req, res) => {
    try {
        // Verify university exists
        const university = await University.findById(req.body.universityId);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        const program = await Program.create(req.body);

        // Update university fee range
        await updateUniversityFeeRange(req.body.universityId);

        const populatedProgram = await Program.findById(program._id)
            .populate('universityId', 'name logo');

        res.status(201).json(populatedProgram);
    } catch (error) {
        console.error('Create Program Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update program
// @route   PUT /api/admin/programs/:id
// @access  Private
const updateProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('universityId', 'name logo');

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Update university fee range
        await updateUniversityFeeRange(program.universityId._id);

        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete program
// @route   DELETE /api/admin/programs/:id
// @access  Private
const deleteProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        const universityId = program.universityId;
        await program.deleteOne();

        // Update university fee range
        await updateUniversityFeeRange(universityId);

        res.json({ message: 'Program deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle program status
// @route   PUT /api/admin/programs/:id/toggle
// @access  Private
const toggleStatus = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        program.isActive = !program.isActive;
        await program.save();

        res.json(program);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update university fee range
async function updateUniversityFeeRange(universityId) {
    try {
        const programs = await Program.find({ 
            universityId, 
            isActive: true 
        }).select('fee');

        if (programs.length > 0) {
            const fees = programs.map(p => p.fee);
            await University.findByIdAndUpdate(universityId, {
                minFee: Math.min(...fees),
                maxFee: Math.max(...fees)
            });
        } else {
            await University.findByIdAndUpdate(universityId, {
                minFee: 0,
                maxFee: 0
            });
        }
    } catch (error) {
        console.error('Update Fee Range Error:', error);
    }
}

// Export all functions
module.exports = {
    getPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleStatus
};