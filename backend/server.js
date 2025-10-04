require('dotenv').config();

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
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ UNDEFINED');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ UNDEFINED');
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

// MongoDB Connection dengan error handling yang lebih baik
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    // FIX: Safe way to log connection details
    console.log('✅ MongoDB Connected successfully!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🎯 Host: ${conn.connection.host}`);
    console.log(`🔢 Port: ${conn.connection.port}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Don't exit in production, just log and continue
    console.log('⚠️  Continuing without database connection');
    return null;
  }
};

// Initialize database dengan async handling
const initializeServer = async () => {
  try {
    // Connect to MongoDB (non-blocking)
    const dbConnection = await connectDB();
    
    // Routes
    app.use('/api/contact', require('./routes/contactRoutes'));

    // API health check
    app.get('/api/health', (req, res) => {
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
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        server_time: new Date().toISOString()
      });
    });

    // Test MongoDB connection endpoint
    app.get('/api/test-db', async (req, res) => {
      try {
        if (mongoose.connection.readyState === 1) {
          // Test dengan simple query
          const result = await mongoose.connection.db.admin().ping();
          res.json({
            success: true,
            message: 'Database connected and responsive',
            ping: result,
            connection: {
              host: mongoose.connection.host,
              database: mongoose.connection.name,
              readyState: mongoose.connection.readyState
            }
          });
        } else {
          res.status(503).json({
            success: false,
            message: 'Database not connected',
            readyState: mongoose.connection.readyState
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Database test failed',
          error: error.message
        });
      }
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

    console.log('✅ Server initialized successfully!');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

// Start the server
initializeServer();

module.exports = app;
