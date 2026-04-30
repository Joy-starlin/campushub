const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });
  } catch (error) {
    console.error('Failed to generate access token:', error);
    throw new Error('Token generation failed');
  }
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });
  } catch (error) {
    console.error('Failed to generate refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
};

// Generate both tokens
const generateTokens = (user) => {
  try {
    const payload = {
      uid: user.uid,
      email: user.email,
      role: user.role,
      university: user.university
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ uid: user.uid });

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  } catch (error) {
    console.error('Failed to generate tokens:', error);
    throw new Error('Token generation failed');
  }
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// Decode token without verification
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Failed to decode token:', error);
    throw new Error('Token decode failed');
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.payload.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.payload.exp) {
      return null;
    }
    
    return new Date(decoded.payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Generate password reset token
const generatePasswordResetToken = (user) => {
  try {
    const payload = {
      uid: user.uid,
      email: user.email,
      type: 'password_reset'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });
  } catch (error) {
    console.error('Failed to generate password reset token:', error);
    throw new Error('Password reset token generation failed');
  }
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });

    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid password reset token');
    } else {
      throw new Error('Password reset token verification failed');
    }
  }
};

// Generate email verification token
const generateEmailVerificationToken = (user) => {
  try {
    const payload = {
      uid: user.uid,
      email: user.email,
      type: 'email_verification'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });
  } catch (error) {
    console.error('Failed to generate email verification token:', error);
    throw new Error('Email verification token generation failed');
  }
};

// Verify email verification token
const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-client'
    });

    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Email verification token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid email verification token');
    } else {
      throw new Error('Email verification token verification failed');
    }
  }
};

// Generate API key token
const generateApiKeyToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.API_SECRET, {
      expiresIn: process.env.API_KEY_EXPIRES_IN || '365d',
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-api-client'
    });
  } catch (error) {
    console.error('Failed to generate API key token:', error);
    throw new Error('API key token generation failed');
  }
};

// Verify API key token
const verifyApiKeyToken = (token) => {
  try {
    return jwt.verify(token, process.env.API_SECRET, {
      issuer: 'bugema-hub-api',
      audience: 'bugema-hub-api-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('API key token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid API key token');
    } else {
      throw new Error('API key token verification failed');
    }
  }
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

// Generate numeric code (for OTPs)
const generateNumericCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
};

// Refresh access token using refresh token
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user data from database
    // TODO: Implement user data retrieval
    const user = {
      uid: decoded.uid,
      email: decoded.email,
      role: 'member',
      university: 'bugema'
    };

    return generateTokens(user);
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw new Error('Access token refresh failed');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generateApiKeyToken,
  verifyApiKeyToken,
  extractTokenFromHeader,
  refreshAccessToken,
  generateNumericCode
};
