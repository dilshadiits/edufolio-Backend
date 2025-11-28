const mongoose = require('mongoose');
const slugify = require('slugify');

const UniversitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'University name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    shortName: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    establishedYear: {
        type: Number
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    address: {
        type: String
    },
    website: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    rating: {
        type: String,
        enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Rated'],
        default: 'Not Rated'
    },
    accreditations: {
        type: [String],
        default: []
    },
    approvals: {
        type: [String],
        default: []
    },
    facilities: {
        type: [String],
        default: []
    },
    highlights: {
        type: [String],
        default: []
    },
    minFee: {
        type: Number,
        default: 0
    },
    maxFee: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    ranking: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for programs count
UniversitySchema.virtual('programs', {
    ref: 'Program',
    localField: '_id',
    foreignField: 'universityId',
    count: true
});

// Auto-generate slug before saving
UniversitySchema.pre('save', function(next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
    next();
});

// Indexes
UniversitySchema.index({ name: 'text', location: 'text', description: 'text' });
UniversitySchema.index({ slug: 1 });
UniversitySchema.index({ featured: 1 });
UniversitySchema.index({ isActive: 1 });

module.exports = mongoose.model('University', UniversitySchema);