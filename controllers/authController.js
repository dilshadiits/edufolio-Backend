const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide name, email, and password' 
            });
        }

        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        
        if (existingAdmin) {
            return res.status(400).json({ 
                message: 'Admin with this email already exists' 
            });
        }

        const admin = await Admin.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'superadmin',
            isActive: true
        });

        const token = generateToken(admin._id);

        res.status(201).json({
            message: 'Admin created successfully',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide email and password' 
            });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        if (!admin.isActive) {
            return res.status(401).json({ 
                message: 'Account is disabled' 
            });
        }

        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = generateToken(admin._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current admin
// @route   GET /api/admin/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.json({
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify token
// @route   GET /api/admin/verify
// @access  Private
const verifyToken = async (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role
        }
    });
};

// @desc    Update password
// @route   PUT /api/admin/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Please provide current and new password' 
            });
        }

        const admin = await Admin.findById(req.admin._id);
        const isMatch = await admin.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Current password is incorrect' 
            });
        }

        admin.password = newPassword;
        await admin.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        const University = require('../models/University');
        const Program = require('../models/Program');
        const Enquiry = require('../models/Enquiry');

        const [universities, programs, enquiries, newEnquiries] = await Promise.all([
            University.countDocuments({ isActive: true }),
            Program.countDocuments({ isActive: true }),
            Enquiry.countDocuments(),
            Enquiry.countDocuments({ status: 'New' })
        ]);

        res.json({
            universities,
            programs,
            enquiries,
            newEnquiries
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all functions
module.exports = {
    register,
    login,
    getMe,
    verifyToken,
    updatePassword,
    getStats
};