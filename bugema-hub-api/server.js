require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initializeSocket } = require('./src/config/socket');

const PORT = process.env.API_PORT || 3001;
const HOST = process.env.API_HOST || '0.0.0.0';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Start server
server.listen(PORT, HOST, () => {
  console.log(`
🚀 Bugema Hub API Server Started!
📍 Server: http://${HOST}:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📅 Started at: ${new Date().toISOString()}
📝 API Documentation: http://${HOST}:${PORT}/api/v1/docs
💚 Health Check: http://${HOST}:${PORT}/health
  `);

  // Log environment variables (without sensitive data)
  console.log('🔧 Environment Configuration:');
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '15m'}`);
  console.log(`   - CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
  
  // Check if required environment variables are set
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FIREBASE_PROJECT_ID'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  Warning: Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.warn(`   - ${envVar}`));
    console.warn('   Please set these environment variables in your .env file');
  }
  
  // Check optional environment variables
  const optionalEnvVars = [
    'EMAIL_USER',
    'AFRICASTALKING_API_KEY',
    'STRIPE_SECRET_KEY',
    'CLOUDINARY_CLOUD_NAME'
  ];
  
  const setOptionalEnvVars = optionalEnvVars.filter(envVar => process.env[envVar]);
  
  if (setOptionalEnvVars.length > 0) {
    console.log('✅ Optional services configured:');
    setOptionalEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle process signals
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM received. Shutting down gracefully...');
  
  // Close HTTP server
  server.close(() => {
    console.log('🔌 HTTP server closed');
    
    // Close Socket.io
    io.close(() => {
      console.log('🔌 Socket.io server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('📡 SIGINT received. Shutting down gracefully...');
  
  // Close HTTP server
  server.close(() => {
    console.log('🔌 HTTP server closed');
    
    // Close Socket.io
    io.close(() => {
      console.log('🔌 Socket.io server closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.log('🔥 Shutting down due to uncaught exception...');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔥 Shutting down due to unhandled promise rejection...');
  process.exit(1);
});

// Export for testing
module.exports = { server, app, io };
