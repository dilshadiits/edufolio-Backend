const University = require('../models/University');
const Program = require('../models/Program');
const Enquiry = require('../models/Enquiry');

// @desc    Get all universities (active only)
// @route   GET /api/public/universities
exports.getUniversities = async (req, res) => {
    try {
        const { 
            location, 
            featured, 
            sort = '-createdAt',
            limit = 50,
            page = 1 
        } = req.query;

        let query = { isActive: true };

        if (location) query.location = new RegExp(location, 'i');
        if (featured === 'true') query.featured = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const universities = await University.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await University.countDocuments(query);

        res.json({
            universities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get university by slug with programs
// @route   GET /api/public/universities/:slug
exports.getUniversityBySlug = async (req, res) => {
    try {
        const university = await University.findOne({ 
            slug: req.params.slug,
            isActive: true 
        });

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        // Get programs for this university
        const programs = await Program.find({ 
            universityId: university._id,
            isActive: true 
        }).sort('name');

        res.json({
            ...university.toObject(),
            programs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all programs (active only)
// @route   GET /api/public/programs
exports.getPrograms = async (req, res) => {
    try {
        const { 
            category, 
            level, 
            mode,
            university,
            minFee,
            maxFee,
            sort = '-createdAt',
            limit = 50,
            page = 1,
            search
        } = req.query;

        let query = { isActive: true };

        if (category) query.category = category;
        if (level) query.level = level;
        if (mode) query.mode = mode;
        if (university) query.universityId = university;
        
        if (minFee || maxFee) {
            query.fee = {};
            if (minFee) query.fee.$gte = parseInt(minFee);
            if (maxFee) query.fee.$lte = parseInt(maxFee);
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const programs = await Program.find(query)
            .populate('universityId', 'name slug logo location')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Program.countDocuments(query);

        res.json({
            programs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get program by slug
// @route   GET /api/public/programs/:slug
exports.getProgramBySlug = async (req, res) => {
    try {
        const program = await Program.findOne({ 
            slug: req.params.slug,
            isActive: true 
        }).populate('universityId', 'name slug logo location rating');

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Get related programs (same category, different program)
        const relatedPrograms = await Program.find({
            category: program.category,
            _id: { $ne: program._id },
            isActive: true
        })
        .populate('universityId', 'name slug logo')
        .limit(4);

        res.json({
            program,
            relatedPrograms
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured data for homepage
// @route   GET /api/public/featured
exports.getFeaturedData = async (req, res) => {
    try {
        const featuredUniversities = await University.find({ 
            featured: true, 
            isActive: true 
        }).limit(6);

        const latestPrograms = await Program.find({ isActive: true })
            .populate('universityId', 'name slug logo')
            .sort('-createdAt')
            .limit(8);

        const stats = {
            universities: await University.countDocuments({ isActive: true }),
            programs: await Program.countDocuments({ isActive: true }),
            enquiries: await Enquiry.countDocuments()
        };

        res.json({
            featuredUniversities,
            latestPrograms,
            stats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/public/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Program.distinct('category', { isActive: true });
        
        // Get count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => ({
                name: cat,
                count: await Program.countDocuments({ category: cat, isActive: true })
            }))
        );

        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit enquiry
// @route   POST /api/public/enquire
exports.submitEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message, programId, universityId } = req.body;

        // Validation
        if (!name || !email || !phone) {
            return res.status(400).json({ 
                message: 'Please provide name, email, and phone number' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email' });
        }

        // Phone validation (basic - at least 10 digits)
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return res.status(400).json({ message: 'Please provide a valid phone number' });
        }

        const enquiry = await Enquiry.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            message: message?.trim() || '',
            programId: programId || null,
            universityId: universityId || null,
            status: 'New'
        });

        res.status(201).json({
            message: 'Enquiry submitted successfully! We will contact you soon.',
            enquiry: {
                id: enquiry._id,
                name: enquiry.name,
                email: enquiry.email
            }
        });
    } catch (error) {
        console.error('Enquiry Error:', error);
        res.status(500).json({ message: 'Failed to submit enquiry. Please try again.' });
    }
};

// @desc    Search universities and programs
// @route   GET /api/public/search
exports.searchAll = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ universities: [], programs: [] });
        }

        const searchRegex = new RegExp(q, 'i');

        const universities = await University.find({
            isActive: true,
            $or: [
                { name: searchRegex },
                { location: searchRegex }
            ]
        })
        .select('name slug logo location')
        .limit(parseInt(limit));

        const programs = await Program.find({
            isActive: true,
            $or: [
                { name: searchRegex },
                { category: searchRegex }
            ]
        })
        .populate('universityId', 'name slug')
        .select('name slug category level fee')
        .limit(parseInt(limit));

        res.json({ universities, programs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};