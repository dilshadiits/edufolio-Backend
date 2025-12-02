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

        // Validate ObjectId
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
        const { name, slug, city } = req.body;

        // Basic validation
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'University name is required' });
        }
        if (!slug || !slug.trim()) {
            return res.status(400).json({ message: 'Slug is required' });
        }
        if (!city || !city.trim()) {
            return res.status(400).json({ message: 'City is required' });
        }

        // Check for duplicate slug
        const existingUniversity = await University.findOne({ 
            slug: slug.trim().toLowerCase() 
        });
        
        if (existingUniversity) {
            return res.status(409).json({ message: 'A university with this slug already exists' });
        }

        // Prepare data
        const universityData = {
            ...req.body,
            slug: slug.trim().toLowerCase()
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

        console.log('========== UPDATE UNIVERSITY ==========');
        console.log('ID:', id);
        console.log('Body:', JSON.stringify(req.body, null, 2));

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        // Find existing university
        const existingUniversity = await University.findById(id);
        if (!existingUniversity) {
            return res.status(404).json({ message: 'University not found' });
        }

        console.log('Found university:', existingUniversity.name);

        // Check for duplicate slug if slug is being changed
        if (req.body.slug && req.body.slug.toLowerCase() !== existingUniversity.slug) {
            const slugExists = await University.findOne({
                slug: req.body.slug.toLowerCase(),
                _id: { $ne: id }
            });
            
            if (slugExists) {
                return res.status(409).json({ message: 'A university with this slug already exists' });
            }
        }

        // Build update object - only include fields that are present in request
        const updateFields = {};

        // Text fields
        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.slug !== undefined) updateFields.slug = req.body.slug.toLowerCase();
        if (req.body.type !== undefined) updateFields.type = req.body.type;
        if (req.body.city !== undefined) updateFields.city = req.body.city;
        if (req.body.state !== undefined) updateFields.state = req.body.state;
        if (req.body.location !== undefined) updateFields.location = req.body.location;
        if (req.body.description !== undefined) updateFields.description = req.body.description;
        if (req.body.rating !== undefined) updateFields.rating = req.body.rating;
        if (req.body.naacGrade !== undefined) updateFields.naacGrade = req.body.naacGrade;
        if (req.body.logo !== undefined) updateFields.logo = req.body.logo;
        if (req.body.bannerImage !== undefined) updateFields.bannerImage = req.body.bannerImage;
        if (req.body.website !== undefined) updateFields.website = req.body.website;
        if (req.body.email !== undefined) updateFields.email = req.body.email;
        if (req.body.phone !== undefined) updateFields.phone = req.body.phone;

        // Number fields
        if (req.body.establishedYear !== undefined) {
            updateFields.establishedYear = Number(req.body.establishedYear) || null;
        }
        if (req.body.minFee !== undefined) {
            updateFields.minFee = Number(req.body.minFee) || 0;
        }
        if (req.body.maxFee !== undefined) {
            updateFields.maxFee = Number(req.body.maxFee) || 0;
        }

        // Boolean fields - explicitly check for undefined
        if (req.body.ugcApproved !== undefined) {
            updateFields.ugcApproved = Boolean(req.body.ugcApproved);
        }
        if (req.body.aicteApproved !== undefined) {
            updateFields.aicteApproved = Boolean(req.body.aicteApproved);
        }
        if (req.body.featured !== undefined) {
            updateFields.featured = Boolean(req.body.featured);
        }
        if (req.body.isActive !== undefined) {
            updateFields.isActive = Boolean(req.body.isActive);
        }

        // Array fields
        if (req.body.highlights !== undefined) {
            updateFields.highlights = Array.isArray(req.body.highlights) 
                ? req.body.highlights 
                : [];
        }
        if (req.body.facilities !== undefined) {
            updateFields.facilities = Array.isArray(req.body.facilities) 
                ? req.body.facilities 
                : [];
        }

        console.log('Update fields:', JSON.stringify(updateFields, null, 2));

        // Update using $set to ensure fields are properly updated
        const updatedUniversity = await University.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!updatedUniversity) {
            return res.status(404).json({ message: 'Failed to update university' });
        }

        console.log('Updated successfully:', updatedUniversity.name);
        console.log('========== UPDATE COMPLETE ==========');

        res.json(updatedUniversity);

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

        // Validate ObjectId
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

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        // Toggle the isActive status
        university.isActive = !university.isActive;
        await university.save();

        console.log('University Status Toggled:', id, 'isActive:', university.isActive);

        res.json({
            message: `University ${university.isActive ? 'activated' : 'deactivated'}`,
            university
        });
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

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid university ID' });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        // Toggle the featured status
        university.featured = !university.featured;
        await university.save();

        console.log('University Featured Toggled:', id, 'featured:', university.featured);

        res.json({
            message: `University ${university.featured ? 'added to' : 'removed from'} featured`,
            university
        });
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
