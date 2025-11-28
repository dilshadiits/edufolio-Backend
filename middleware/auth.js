const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Protect routes - verify token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized - No token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.admin = await Admin.findById(decoded.id).select('-password');

        if (!req.admin) {
            return res.status(401).json({ message: 'Not authorized - Admin not found' });
        }

        if (!req.admin.isActive) {
            return res.status(401).json({ message: 'Account is disabled' });
        }

        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        return res.status(401).json({ message: 'Not authorized - Invalid token' });
    }
};

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ 
                message: `Role '${req.admin.role}' is not authorized to access this resource`
            });
        }
        next();
    };
};

module.exports = { generateToken, protect, authorize };