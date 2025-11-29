const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'http://127.0.0.1:5173',
        'https://edufolio-frontend.vercel.app',  // ✅ ADD THIS!
        'https://edufolio-frontend-*.vercel.app' // ✅ For preview deployments
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/universities', require('./routes/universityRoutes'));
app.use('/api/admin/programs', require('./routes/programRoutes'));
app.use('/api/admin/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/setup', require('./routes/setupRoute')); // TEMPORARY

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        message: 'EduFolio API is Running!',
        version: '1.0.0',
        endpoints: {
            public: '/api/public',
            admin: '/api/admin'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});