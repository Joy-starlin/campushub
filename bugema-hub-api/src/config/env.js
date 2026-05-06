require('dotenv').config();

// Required environment variables validation
const requiredEnvVars = [
  'API_PORT',
  'NODE_ENV',
  'CLIENT_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease set these environment variables in your .env file');
  console.error('Copy .env.example to .env and fill in the required values');
  process.exit(1);
}

// Server Configuration
const PORT = parseInt(process.env.API_PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Firebase Configuration
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Email Configuration (Nodemailer)
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT) || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@bugema-hub.com';

// SMS Configuration (Africa's Talking)
const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;
const AT_FROM = process.env.AT_FROM || 'BugemaHub';

// Stripe Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PRICE_MEMBER = process.env.STRIPE_PRICE_MEMBER;
const STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM;

// MTN Mobile Money Configuration
const MTN_BASE_URL = process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY;
const MTN_API_USER = process.env.MTN_API_USER;
const MTN_API_KEY = process.env.MTN_API_KEY;
const MTN_CALLBACK_URL = process.env.MTN_CALLBACK_URL;

// Airtel Money Configuration
const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.africa';
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

// Flutterwave Configuration
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_ENCRYPTION_KEY = process.env.FLW_ENCRYPTION_KEY;
const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH;

// Africa's Talking SMS Configuration
const AT_SMS_FROM = process.env.AT_SMS_FROM || 'BugemaHub';

// Web Push Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL;

// Rate Limiting Configuration
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

// Optional Configuration with defaults
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,txt').split(',');
const AUTH_RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5;
const UPLOAD_RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS) || 20;

// Development/Testing flags
const DEBUG = process.env.DEBUG === 'true';
const ENABLE_LOGGING = process.env.ENABLE_LOGGING !== 'false';
const ENABLE_API_DOCS = process.env.ENABLE_API_DOCS !== 'false';

// Monitoring flags
const ENABLE_HEALTH_CHECK = process.env.ENABLE_HEALTH_CHECK !== 'false';
const ENABLE_METRICS = process.env.ENABLE_METRICS === 'true';

// Helper function to check if optional services are configured
const isEmailConfigured = !!(EMAIL_USER && EMAIL_PASS);
const isSmsConfigured = !!(AT_API_KEY && AT_USERNAME);
const isStripeConfigured = !!STRIPE_SECRET_KEY;
const isMtnMoneyConfigured = !!(MTN_SUBSCRIPTION_KEY && MTN_API_USER && MTN_API_KEY);
const isAirtelMoneyConfigured = !!(AIRTEL_CLIENT_ID && AIRTEL_CLIENT_SECRET);

// Log configuration status on startup
if (DEBUG) {
  console.log('🔧 Environment Configuration:');
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - NODE_ENV: ${NODE_ENV}`);
  console.log(`   - CLIENT_URL: ${CLIENT_URL}`);
  console.log(`   - JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}`);
  console.log(`   - RATE_LIMIT_MAX: ${RATE_LIMIT_MAX}`);
  
  console.log('✅ Services Configuration:');
  console.log(`   - Email: ${isEmailConfigured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - SMS: ${isSmsConfigured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Stripe: ${isStripeConfigured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Flutterwave: ${!!FLW_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - MTN Money: ${isMtnMoneyConfigured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Airtel Money: ${isAirtelMoneyConfigured ? '✅ Configured' : '❌ Not configured'}`);
}

// Export all configuration as an object for convenience
const config = {
  // Server
  PORT,
  NODE_ENV,
  CLIENT_URL,
  
  // JWT
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  
  // Firebase
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  
  // Email
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  
  // SMS
  AT_API_KEY,
  AT_USERNAME,
  AT_FROM,
  AT_SMS_FROM,
  
  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_MEMBER,
  STRIPE_PRICE_PREMIUM,
  
  // Mobile Money
  MTN_BASE_URL,
  MTN_SUBSCRIPTION_KEY,
  MTN_API_USER,
  MTN_API_KEY,
  MTN_CALLBACK_URL,
  AIRTEL_BASE_URL,
  AIRTEL_CLIENT_ID,
  AIRTEL_CLIENT_SECRET,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  UPLOAD_RATE_LIMIT_MAX_REQUESTS,
  
  // File Upload
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  
  // Flags
  DEBUG,
  ENABLE_LOGGING,
  ENABLE_API_DOCS,
  ENABLE_HEALTH_CHECK,
  ENABLE_METRICS,
  
  // Service Status
  isEmailConfigured,
  isSmsConfigured,
  isStripeConfigured,
  isMtnMoneyConfigured,
  isAirtelMoneyConfigured
};

module.exports = {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  AT_API_KEY,
  AT_USERNAME,
  AT_FROM,
  AT_SMS_FROM,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_EMAIL,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_MEMBER,
  STRIPE_PRICE_PREMIUM,
  MTN_BASE_URL,
  MTN_SUBSCRIPTION_KEY,
  MTN_API_USER,
  MTN_API_KEY,
  MTN_CALLBACK_URL,
  AIRTEL_BASE_URL,
  AIRTEL_CLIENT_ID,
  AIRTEL_CLIENT_SECRET,
  FLW_PUBLIC_KEY,
  FLW_SECRET_KEY,
  FLW_ENCRYPTION_KEY,
  FLW_SECRET_HASH,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  UPLOAD_RATE_LIMIT_MAX_REQUESTS,
  DEBUG,
  ENABLE_LOGGING,
  ENABLE_API_DOCS,
  ENABLE_HEALTH_CHECK,
  ENABLE_METRICS,
  isEmailConfigured,
  isSmsConfigured,
  isStripeConfigured,
  isMtnMoneyConfigured,
  isAirtelMoneyConfigured,
  config
};
