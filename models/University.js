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
        unique: true,
        lowercase: true
    },
    shortName: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['Private', 'Government', 'Deemed', 'State', 'Central', 'Autonomous'],
        default: 'Private'
    },
    logo: {
        type: String,
        default: ''
    },
    bannerImage: {
        type: String,
        default: ''
    },
    // Keep 'banner' as alias for backward compatibility
    banner: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    establishedYear: {
        type: Number
    },
    // Location fields
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    // Contact
    website: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    // Ratings & Approvals
    rating: {
        type: String,
        default: ''
    },
    naacGrade: {
        type: String,
        enum: ['', 'A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Rated'],
        default: ''
    },
    ugcApproved: {
        type: Boolean,
        default: true
    },
    aicteApproved: {
        type: Boolean,
        default: false
    },
    accreditations: {
        type: [String],
        default: []
    },
    approvals: {
        type: [String],
        default: []
    },
    // Features
    facilities: {
        type: [String],
        default: []
    },
    highlights: {
        type: [String],
        default: []
    },
    // Fee
    minFee: {
        type: Number,
        default: 0
    },
    maxFee: {
        type: Number,
        default: 0
    },
    // Status
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

// Auto-generate slug before saving (only if not provided)
UniversitySchema.pre('save', function(next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
    
    // Sync bannerImage and banner fields
    if (this.bannerImage && !this.banner) {
        this.banner = this.bannerImage;
    } else if (this.banner && !this.bannerImage) {
        this.bannerImage = this.banner;
    }
    
    // Build location from city and state if not provided
    if (!this.location && this.city) {
        this.location = this.state ? `${this.city}, ${this.state}` : this.city;
    }
    
    next();
});

// Indexes
UniversitySchema.index({ name: 'text', location: 'text', description: 'text' });
UniversitySchema.index({ slug: 1 });
UniversitySchema.index({ featured: 1 });
UniversitySchema.index({ isActive: 1 });
UniversitySchema.index({ city: 1 });

module.exports = mongoose.model('University', UniversitySchema);
