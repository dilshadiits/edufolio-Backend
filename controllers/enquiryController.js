const Enquiry = require('../models/Enquiry');

// @desc    Get all enquiries (Admin)
// @route   GET /api/admin/enquiries
// @access  Private
const getEnquiries = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const enquiries = await Enquiry.find(query)
            .populate('programId', 'name')
            .populate('universityId', 'name')
            .sort({ createdAt: -1 });
            
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single enquiry
// @route   GET /api/admin/enquiries/:id
// @access  Private
const getEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id)
            .populate('programId', 'name fee duration')
            .populate('universityId', 'name logo');
        
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        
        res.json(enquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create enquiry (Public)
// @route   POST /api/public/enquiry
// @access  Public
const createEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message, programId, universityId, source } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ 
                message: 'Please provide name, email, and phone' 
            });
        }

        const enquiry = await Enquiry.create({
            name,
            email,
            phone,
            message,
            programId: programId || null,
            universityId: universityId || null,
            source: source || 'Website',
            status: 'New'
        });

        res.status(201).json({
            message: 'Enquiry submitted successfully',
            enquiry
        });
    } catch (error) {
        console.error('Create Enquiry Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update enquiry
// @route   PUT /api/admin/enquiries/:id
// @access  Private
const updateEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json(enquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete enquiry
// @route   DELETE /api/admin/enquiries/:id
// @access  Private
const deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        await enquiry.deleteOne();

        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update enquiry status
// @route   PUT /api/admin/enquiries/:id/status
// @access  Private
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json(enquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Export all functions
module.exports = {
    getEnquiries,
    getEnquiry,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    updateStatus
};