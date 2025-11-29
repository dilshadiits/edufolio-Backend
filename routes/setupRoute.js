const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

router.get('/setup-admin', async (req, res) => {
  try {
    // Check if admin exists
    const existing = await Admin.findOne({ email: 'admin@edufolio.com' });
    
    if (existing) {
      // Reset password if admin exists
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.updateOne(
        { email: 'admin@edufolio.com' },
        { password: hashedPassword, isActive: true }
      );
      return res.json({ 
        message: 'Admin exists! Password reset to: admin123',
        email: 'admin@edufolio.com'
      });
    }
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      name: 'Admin',
      email: 'admin@edufolio.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true
    });
    
    await admin.save();
    res.json({ 
      message: 'Admin created successfully!',
      credentials: {
        email: 'admin@edufolio.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;