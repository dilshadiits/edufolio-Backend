const University = require('../models/University');
const Program = require('../models/Program');
const Enquiry = require('../models/Enquiry');

// ==================== UNIVERSITIES ====================

// 1. Get All Universities (with filtering)
exports.getUniversities = async (req, res) => {
    try {
        const { featured, minFee, maxFee, rating, search, limit } = req.query;
        
        let query = { isActive: true };
        
        if (featured === 'true') {
            query.featured = true;
        }
        
        if (minFee) {
            query.minFee = { $gte: Number(minFee) };
        }
        if (maxFee) {
            query.maxFee = { $lte: Number(maxFee) };
        }
        
        if (rating) {
            query.rating = rating;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }
        
        let universitiesQuery = University.find(query)
            .select('name slug location rating logo banner minFee maxFee featured accreditations')
            .sort({ featured: -1, createdAt: -1 });
        
        if (limit) {
            universitiesQuery = universitiesQuery.limit(Number(limit));
        }
        
        const universities = await universitiesQuery;
        res.json(universities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Get Single University by Slug
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
        }).select('name slug category level duration fee image');
        
        res.json({
            ...university.toObject(),
            programs
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== PROGRAMS ====================

// 3. Get All Programs (with filtering)
exports.getPrograms = async (req, res) => {
    try {
        const { category, level, universityId, minFee, maxFee, search, limit } = req.query;
        
        let query = { isActive: true };
        
        if (category) {
            query.category = category;
        }
        
        if (level) {
            query.level = level;
        }
        
        if (universityId) {
            query.universityId = universityId;
        }
        
        if (minFee || maxFee) {
            query.fee = {};
            if (minFee) query.fee.$gte = Number(minFee);
            if (maxFee) query.fee.$lte = Number(maxFee);
        }
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        let programsQuery = Program.find(query)
            .populate('universityId', 'name slug location logo rating')
            .sort({ createdAt: -1 });
        
        if (limit) {
            programsQuery = programsQuery.limit(Number(limit));
        }
        
        const programs = await programsQuery;
        res.json(programs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Get Single Program by Slug
exports.getProgramBySlug = async (req, res) => {
    try {
        const program = await Program.findOne({ 
            slug: req.params.slug,
            isActive: true 
        }).populate('universityId');

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }
        
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ENQUIRIES ====================

// 5. Submit Enquiry
exports.submitEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message, universityId, programId } = req.body;
        
        if (!name || !email || !phone) {
            return res.status(400).json({ 
                message: 'Please provide name, email, and phone number' 
            });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email' });
        }
        
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return res.status(400).json({ message: 'Please provide a valid phone number' });
        }
        
        const newEnquiry = new Enquiry({ 
            name, 
            email, 
            phone, 
            message: message || '',
            universityId: universityId || null, 
            programId: programId || null,
            status: 'New'
        });
        
        await newEnquiry.save();
        
        res.status(201).json({ 
            message: 'Thank you! Your enquiry has been submitted successfully.',
            enquiry: {
                id: newEnquiry._id,
                name: newEnquiry.name
            }
        });
    } catch (err) {
        console.error("Enquiry Error:", err);
        res.status(500).json({ message: 'Error submitting enquiry. Please try again.' });
    }
};

// ==================== ADDITIONAL HELPERS ====================

// 6. Get Categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Program.distinct('category', { isActive: true });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. Get Featured Data (for homepage)
exports.getFeaturedData = async (req, res) => {
    try {
        const [universities, programs, stats] = await Promise.all([
            University.find({ featured: true, isActive: true })
                .select('name slug location rating logo banner')
                .limit(6),
            Program.find({ isActive: true })
                .populate('universityId', 'name slug logo')
                .limit(8),
            // Get stats
            Promise.all([
                University.countDocuments({ isActive: true }),
                Program.countDocuments({ isActive: true }),
                Enquiry.countDocuments()
            ])
        ]);
        
        res.json({ 
            universities, 
            programs,
            stats: {
                universities: stats[0],
                programs: stats[1],
                enquiries: stats[2]
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 8. Search All (Universities & Programs)
exports.searchAll = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ universities: [], programs: [] });
        }

        const searchRegex = new RegExp(q, 'i');

        const [universities, programs] = await Promise.all([
            University.find({
                isActive: true,
                $or: [
                    { name: searchRegex },
                    { location: searchRegex }
                ]
            })
            .select('name slug logo location')
            .limit(parseInt(limit)),

            Program.find({
                isActive: true,
                $or: [
                    { name: searchRegex },
                    { category: searchRegex }
                ]
            })
            .populate('universityId', 'name slug')
            .select('name slug category level fee')
            .limit(parseInt(limit))
        ]);

        res.json({ universities, programs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};