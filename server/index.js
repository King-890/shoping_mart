require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notifyRoutes = require('./routes/notifyRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure required directories exist
const dirs = ['data', 'uploads'];
dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from uploads directory (Legacy support)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route (Diagnostic)
app.get('/', (req, res) => {
    res.json({
        message: 'Gaya ji Shopping mart API is running',
        timestamp: new Date().toISOString(),
        endpoints: ['/api/products', '/api/auth', '/api/health']
    });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// JSON 404 Handler (Prevents HTML 404 pages)
app.use((req, res) => {
    console.warn(`404: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: `API Route ${req.method} ${req.url} not found`
    });
});

// Global Error Handler (Must be at the end)
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
