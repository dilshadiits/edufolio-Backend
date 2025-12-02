const University = require('../models/University');
const Program = require('../models/Program');
const mongoose = require('mongoose');

// @desc    Get all universities (Admin)
// @route   GET /api/admin/universities
// @access  Private
const getUniversities = async (req, res) => {
    try {
        const universities = await University.find().sort({ createdAt: -1 });
        res.json(universities);
    } catch (error) {
        console.error('Get Universities Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single university
// @route   GET /api/admin/universities/:id
// @access  Private
const getUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.json(university);
    } catch (error) {
        console.error('Get University Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create university
// @route   POST /api/admin/universities
// @access  Private
const createUniversity = async (req, res) => {
    try {
        const { name, slug, location, description } = req.body;

        // Basic validation - match your model's required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'University name is required' });
        }
        if (!location || !location.trim()) {
            return res.status(400).json({ message: 'Location is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Check for duplicate slug if provided
        const checkSlug = slug ? slug.trim().toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const existingUniversity = await University.findOne({ slug: checkSlug });
        if (existingUniversity) {
            return res.status(409).json({ message: 'A university with this slug already exists' });
        }

        // Prepare data
        const universityData = {
            ...req.body,
            slug: checkSlug
        };

        const university = await University.create(universityData);
        
        console.log('University Created:', university._id, university.name);
        
        res.status(201).json(university);
    } catch (error) {
        console.error('Create University Error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A university with this slug already exists' });
        }
        
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update university
// @route   PUT /api/admin/universities/:id
// @access  Private
const updateUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        console.log('===== UPDATE UNIVERSITY =====');
        console.log('ID:', id);
        console.log('Received:', JSON.stringify(body, null, 2));

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        // Find existing university
        const existing = await University.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'University not found' });
        }

        console.log('Current:', existing.name);

        // Check for duplicate slug if changing
        if (body.slug && body.slug.toLowerCase() !== existing.slug) {
            const slugExists = await University.findOne({
                slug: body.slug.toLowerCase(),
                _id: { $ne: id }
            });
            if (slugExists) {
                return res.status(409).json({ message: 'A university with this slug already exists' });
            }
        }

        // Build update object based on YOUR MODEL SCHEMA
        const updateData = {};

        // String fields from your model
        if (body.name !== undefined) updateData.name = body.name;
        if (body.slug !== undefined) updateData.slug = body.slug.toLowerCase();
        if (body.shortName !== undefined) updateData.shortName = body.shortName;
        if (body.logo !== undefined) updateData.logo = body.logo;
        if (body.banner !== undefined) updateData.banner = body.banner;
        if (body.bannerImage !== undefined) updateData.banner = body.bannerImage; // Map bannerImage to banner
        if (body.description !== undefined) updateData.description = body.description;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.website !== undefined) updateData.website = body.website;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phone !== undefined) updateData.phone = body.phone;

        // Rating field (enum in your model)
        if (body.rating !== undefined) {
            const validRatings = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Rated'];
            if (validRatings.includes(body.rating)) {
                updateData.rating = body.rating;
            }
        }
        
        // Also accept naacGrade and map to rating
        if (body.naacGrade !== undefined) {
            const validRatings = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Rated'];
            if (validRatings.includes(body.naacGrade)) {
                updateData.rating = body.naacGrade;
            }
        }

        // Number fields
        if (body.establishedYear !== undefined) {
            const year = parseInt(body.establishedYear, 10);
            if (!isNaN(year) && year >= 1800 && year <= new Date().getFullYear()) {
                updateData.establishedYear = year;
            }
        }
        if (body.minFee !== undefined) {
            updateData.minFee = parseInt(body.minFee, 10) || 0;
        }
        if (body.maxFee !== undefined) {
            updateData.maxFee = parseInt(body.maxFee, 10) || 0;
        }
        if (body.ranking !== undefined) {
            const rank = parseInt(body.ranking, 10);
            if (!isNaN(rank)) {
                updateData.ranking = rank;
            }
        }

        // Boolean fields
        if (body.featured !== undefined) {
            updateData.featured = Boolean(body.featured);
        }
        if (body.isActive !== undefined) {
            updateData.isActive = Boolean(body.isActive);
        }

        // Array fields from your model
        if (body.accreditations !== undefined) {
            updateData.accreditations = Array.isArray(body.accreditations) 
                ? body.accreditations 
                : [];
        }
        if (body.approvals !== undefined) {
            updateData.approvals = Array.isArray(body.approvals) 
                ? body.approvals 
                : [];
        }
        if (body.facilities !== undefined) {
            updateData.facilities = Array.isArray(body.facilities) 
                ? body.facilities 
                : [];
        }
        if (body.highlights !== undefined) {
            updateData.highlights = Array.isArray(body.highlights) 
                ? body.highlights 
                : [];
        }

        // Handle UGC/AICTE approvals by adding to approvals array
        if (body.ugcApproved !== undefined || body.aicteApproved !== undefined) {
            let approvals = existing.approvals || [];
            
            if (body.ugcApproved === true && !approvals.includes('UGC')) {
                approvals.push('UGC');
            } else if (body.ugcApproved === false) {
                approvals = approvals.filter(a => a !== 'UGC');
            }
            
            if (body.aicteApproved === true && !approvals.includes('AICTE')) {
                approvals.push('AICTE');
            } else if (body.aicteApproved === false) {
                approvals = approvals.filter(a => a !== 'AICTE');
            }
            
            updateData.approvals = approvals;
        }

        // Build location from city/state if provided
        if (body.city !== undefined || body.state !== undefined) {
            const city = body.city || '';
            const state = body.state || '';
            if (city && state) {
                updateData.location = `${city}, ${state}`;
            } else if (city) {
                updateData.location = city;
            }
        }

        console.log('Update data:', JSON.stringify(updateData, null, 2));

        // Perform update
        const updated = await University.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Failed to update university' });
        }

        console.log('Success:', updated.name);
        console.log('===== UPDATE COMPLETE =====');

        res.json(updated);

    } catch (error) {
        console.error('Update University Error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A university with this slug already exists' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: 'Failed to update university' });
    }
};

// @desc    Delete university
// @route   DELETE /api/admin/universities/:id
// @access  Private
const deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        const university = await University.findById(id);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        // Delete associated programs
        await Program.deleteMany({ universityId: id });
        await University.findByIdAndDelete(id);

        console.log('University Deleted:', id);
        res.json({ message: 'University deleted successfully' });
    } catch (error) {
        console.error('Delete University Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle university active status
// @route   PUT /api/admin/universities/:id/toggle
// @access  Private
const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        const university = await University.findById(id);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        university.isActive = !university.isActive;
        await university.save();

        console.log('Status Toggled:', id, university.isActive);
        res.json(university);
    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle university featured status
// @route   PUT /api/admin/universities/:id/featured
// @access  Private
const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        const university = await University.findById(id);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        university.featured = !university.featured;
        await university.save();

        console.log('Featured Toggled:', id, university.featured);
        res.json(university);
    } catch (error) {
        console.error('Toggle Featured Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUniversities,
    getUniversity,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    toggleStatus,
    toggleFeatured
};
