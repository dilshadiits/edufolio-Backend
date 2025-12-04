const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University'
    },
    source: {
    type: String,
    enum: ['Website', 'Landing Page', 'Contact Form', 'Program Page', 'University Page', 'Enrollment Form', 'Other'],  // 👈 Added here
    default: 'Website'
},

    status: {
        type: String,
        enum: ['New', 'Contacted', 'Interested', 'Not Interested', 'Converted', 'Closed'],
        default: 'New'
    },
    notes: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
EnquirySchema.index({ status: 1 });
EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ email: 1 });

module.exports = mongoose.model('Enquiry', EnquirySchema);
