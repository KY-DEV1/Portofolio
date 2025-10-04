require('dotenv').config(); // Pastikan ini di paling atas

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced environment variables debug
console.log('🚀 Starting server...');
console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ UNDEFINED');
console.log('MONGODB_URL:', process.env.MONGODB_URL ? '✅ SET' : '❌ UNDEFINED');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ UNDEFINED');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ UNDEFINED');

// Check all possible MongoDB URI sources
const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;
console.log('Final MongoDB URI:', mongoURI ? '✅ AVAILABLE' : '❌ MISSING');
console.log('================================');

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://portofolio-ochre-zeta.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection dengan support multiple environment variable names
const connectDB = async () => {
  try {
    // Support both MONGODB_URI and MONGODB_URL
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;
    
    if (!mongoURI) {
      const errorMsg = 'MongoDB URI is not defined. Please set MONGODB_URI or MONGODB_URL environment variable.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Detailed debug information
    console.log('🔍 Debug Info:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Available DB vars:', {
      MONGODB_URI: !!process.env.MONGODB_URI,
      MONGODB_URL: !!process.env.MONGODB_URL
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.log('💥 Production mode - exiting...');
      process.exit(1);
    } else {
      console.log('⚠️  Development mode - continuing without DB');
    }
  }
};

// Initialize database
connectDB();

// ... rest of your server code (routes, etc.)

// Email transporter configuration dengan fallback
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email configuration missing - emails will not be sent');
    return null;
  }

  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Routes
app.use('/api/contact', require('./routes/contactRoutes'));

// API health check dengan database status
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusText = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: statusText[dbStatus],
      connected: dbStatus === 1
    },
    email: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    }
  });
});

// Test endpoint untuk check environment variables
app.get('/api/debug-env', (req, res) => {
  res.json({
    MONGODB_URI: process.env.MONGODB_URI ? '***SET***' : 'UNDEFINED',
    EMAIL_USER: process.env.EMAIL_USER ? '***SET***' : 'UNDEFINED', 
    EMAIL_PASS: process.env.EMAIL_PASS ? '***SET***' : 'UNDEFINED',
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL
  });
});

// Serve frontend untuk semua route lainnya
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler untuk API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API route not found' 
  });
});

module.exports = app;

