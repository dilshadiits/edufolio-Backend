const University = require('../models/University');
const Program = require('../models/Program');
const Enquiry = require('../models/Enquiry');

// ==================== DASHBOARD ====================

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUniversities,
            totalPrograms,
            totalEnquiries,
            newEnquiries,
            recentEnquiries
        ] = await Promise.all([
            University.countDocuments(),
            Program.countDocuments(),
            Enquiry.countDocuments(),
            Enquiry.countDocuments({ status: 'New' }),
            Enquiry.find()
                .sort('-createdAt')
                .limit(5)
                .populate('programId', 'name')
                .populate('universityId', 'name')
        ]);

        // Get enquiries by status
        const enquiriesByStatus = await Enquiry.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            stats: {
                universities: totalUniversities,
                programs: totalPrograms,
                enquiries: totalEnquiries,
                newEnquiries
            },
            enquiriesByStatus,
            recentEnquiries
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== UNIVERSITIES ====================

// @desc    Get all universities (admin - includes inactive)
// @route   GET /api/admin/universities
exports.getAllUniversities = async (req, res) => {
    try {
        const universities = await University.find().sort('-createdAt');
        res.json(universities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add university
// @route   POST /api/admin/universities
exports.addUniversity = async (req, res) => {
    try {
        const { name, slug, logo, banner, location, rating, accreditations, description, minFee, maxFee, featured, isActive } = req.body;

        if (!name || !slug || !location) {
            return res.status(400).json({ message: 'Name, slug, and location are required' });
        }

        // Check duplicate slug
        const existing = await University.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: 'A university with this slug already exists' });
        }

        const university = await University.create({
            name: name.trim(),
            slug: slug.toLowerCase().trim(),
            logo: logo || '',
            banner: banner || '',
            location: location.trim(),
            rating: rating || 'NA',
            accreditations: accreditations || [],
            description: description || '',
            minFee: Number(minFee) || 0,
            maxFee: Number(maxFee) || 0,
            featured: featured || false,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ message: 'University added successfully!', university });
    } catch (error) {
        console.error('Add University Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update university
// @route   PUT /api/admin/universities/:id
exports.updateUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        // Check slug uniqueness if being changed
        if (req.body.slug) {
            const existing = await University.findOne({ 
                slug: req.body.slug.toLowerCase(), 
                _id: { $ne: id } 
            });
            if (existing) {
                return res.status(400).json({ message: 'This slug is already in use' });
            }
            req.body.slug = req.body.slug.toLowerCase();
        }

        // Convert fees to numbers
        if (req.body.minFee) req.body.minFee = Number(req.body.minFee);
        if (req.body.maxFee) req.body.maxFee = Number(req.body.maxFee);

        const university = await University.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.json({ message: 'University updated successfully!', university });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete university
// @route   DELETE /api/admin/universities/:id
exports.deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        const university = await University.findById(id);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        // Delete associated programs
        const deletedPrograms = await Program.deleteMany({ universityId: id });

        await University.findByIdAndDelete(id);

        res.json({ 
            message: `University and ${deletedPrograms.deletedCount} associated programs deleted` 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== PROGRAMS ====================

// @desc    Get all programs (admin)
// @route   GET /api/admin/programs
exports.getAllPrograms = async (req, res) => {
    try {
        const { universityId } = req.query;
        
        let query = {};
        if (universityId) query.universityId = universityId;

        const programs = await Program.find(query)
            .populate('universityId', 'name slug logo')
            .sort('-createdAt');

        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add program
// @route   POST /api/admin/programs
exports.addProgram = async (req, res) => {
    try {
        const { universityId, name, category, level, duration, mode, fee, feePeriod, description, eligibility, image, isActive } = req.body;

        if (!universityId || !name || !category || !level || !duration || !fee || !description) {
            return res.status(400).json({ 
                message: 'Please fill all required fields' 
            });
        }

        // Check university exists
        const university = await University.findById(universityId);
        if (!university) {
            return res.status(400).json({ message: 'University not found' });
        }

        const program = await Program.create({
            universityId,
            name: name.trim(),
            category,
            level,
            duration,
            mode: mode || 'Online',
            fee: Number(fee),
            feePeriod: feePeriod || 'Total',
            description,
            eligibility: eligibility || 'Graduate',
            image: image || '',
            isActive: isActive !== undefined ? isActive : true
        });

        await program.populate('universityId', 'name slug logo');

        res.status(201).json({ message: 'Program added successfully!', program });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A program with this name already exists' });
        }
        console.error('Add Program Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update program
// @route   PUT /api/admin/programs/:id
exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.body.fee) req.body.fee = Number(req.body.fee);

        const program = await Program.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('universityId', 'name slug logo');

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        res.json({ message: 'Program updated successfully!', program });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete program
// @route   DELETE /api/admin/programs/:id
exports.deleteProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndDelete(req.params.id);
        
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        res.json({ message: 'Program deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== ENQUIRIES ====================

// @desc    Get all enquiries
// @route   GET /api/admin/enquiries
exports.getAllEnquiries = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = {};

        if (status && status !== 'all') query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const enquiries = await Enquiry.find(query)
            .populate('programId', 'name slug')
            .populate('universityId', 'name slug')
            .sort('-createdAt');

        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update enquiry status
// @route   PUT /api/admin/enquiries/:id
exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
        .populate('programId', 'name')
        .populate('universityId', 'name');

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json({ message: 'Enquiry updated', enquiry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete enquiry
// @route   DELETE /api/admin/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json({ message: 'Enquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};