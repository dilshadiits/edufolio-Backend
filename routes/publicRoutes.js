const express = require('express');
const router = express.Router();
const University = require('../models/University');
const Program = require('../models/Program');
const { createEnquiry } = require('../controllers/enquiryController');

// Get all active universities
router.get('/universities', async (req, res) => {
    try {
        const { search, rating, featured } = req.query;
        
        let query = { isActive: true };
        
        if (rating) query.rating = rating;
        if (featured === 'true') query.featured = true;
        
        let universities = await University.find(query)
            .select('-__v')
            .sort({ featured: -1, createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            universities = universities.filter(uni => 
                uni.name.toLowerCase().includes(searchLower) ||
                uni.location?.toLowerCase().includes(searchLower)
            );
        }

        res.json(universities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single university by slug
router.get('/universities/:slug', async (req, res) => {
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
        }).select('name slug category level duration fee mode');

        res.json({ ...university.toObject(), programs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all active programs
router.get('/programs', async (req, res) => {
    try {
        const { search, category, level, university, minFee, maxFee } = req.query;
        
        let query = { isActive: true };
        
        if (category) query.category = category;
        if (level) query.level = level;
        if (university) query.universityId = university;
        if (minFee || maxFee) {
            query.fee = {};
            if (minFee) query.fee.$gte = Number(minFee);
            if (maxFee) query.fee.$lte = Number(maxFee);
        }

        let programs = await Program.find(query)
            .populate('universityId', 'name logo location rating')
            .select('-__v')
            .sort({ featured: -1, createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            programs = programs.filter(prog => 
                prog.name.toLowerCase().includes(searchLower) ||
                prog.category.toLowerCase().includes(searchLower)
            );
        }

        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single program by slug
router.get('/programs/:slug', async (req, res) => {
    try {
        const program = await Program.findOne({ 
            slug: req.params.slug,
            isActive: true 
        }).populate('universityId', 'name logo location rating accreditations website');

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Get related programs
        const relatedPrograms = await Program.find({
            _id: { $ne: program._id },
            category: program.category,
            isActive: true
        })
        .populate('universityId', 'name logo')
        .limit(4)
        .select('name slug fee duration universityId');

        res.json({ ...program.toObject(), relatedPrograms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Program.distinct('category', { isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get featured universities
router.get('/featured/universities', async (req, res) => {
    try {
        const universities = await University.find({ 
            isActive: true, 
            featured: true 
        })
        .limit(6)
        .select('name slug logo banner location rating');

        res.json(universities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get featured programs
router.get('/featured/programs', async (req, res) => {
    try {
        const programs = await Program.find({ 
            isActive: true, 
            featured: true 
        })
        .populate('universityId', 'name logo')
        .limit(8)
        .select('name slug category level fee duration universityId');

        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit enquiry
router.post('/enquiry', createEnquiry);

module.exports = router;