const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edufolio';

const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'superadmin' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const existingAdmin = await Admin.findOne({ email: 'admin@edufolio.com' });
        
        if (existingAdmin) {
            console.log('\n⚠️  Admin already exists! Resetting password...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Admin.updateOne(
                { email: 'admin@edufolio.com' },
                { password: hashedPassword, isActive: true }
            );
            
            console.log('✅ Password reset successful!');
            console.log('================================');
            console.log('Email: admin@edufolio.com');
            console.log('Password: admin123');
            console.log('================================\n');
            
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new Admin({
            name: 'Admin',
            email: 'admin@edufolio.com',
            password: hashedPassword,
            role: 'superadmin',
            isActive: true
        });

        await admin.save();

        console.log('\n✅ Admin created successfully!');
        console.log('================================');
        console.log('Email: admin@edufolio.com');
        console.log('Password: admin123');
        console.log('================================');
        console.log('\n⚠️  Please change password after login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();