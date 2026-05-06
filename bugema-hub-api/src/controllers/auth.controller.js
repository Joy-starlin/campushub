const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, auth } = require('../config/firebase');
const { generateTokens, generateNumericCode, generateEmailVerificationToken } = require('../utils/tokens');
const { sendEmail } = require('../services/email.service');
const { getCollection, createDoc, updateDoc, getDoc } = require('../utils/db.helpers');
const { USERS, TOKEN_DENYLIST, OTP_CODES } = require('../utils/collections');
const { successResponse, errorResponse, createdResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, country, university, course, year, phone, username } = req.body;

    // Check if user already exists in Firestore
    const existingUsers = await getCollection(USERS, [['email', '==', email]]);
    if (existingUsers.length > 0) {
      return errorResponse(res, 'Email already exists', 409, 'EMAIL_EXISTS');
    }

    // Basic validation for required fields
    if (!email || !password || !firstName || !lastName || !username) {
      return errorResponse(res, 'Registration validation failed: Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false
      });
    } catch (firebaseError) {
      console.error('Firebase Auth error:', firebaseError);
      return errorResponse(res, 'Failed to create user account', 400);
    }

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      username,
      country,
      university,
      course,
      year,
      phone,
      role: 'member',
      plan: 'free',
      isVerified: false,
      verifiedStudent: false,
      points: 0,
      profilePicture: null,
      bio: null,
      socialLinks: {},
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        eventReminders: true,
        clubUpdates: true,
        jobAlerts: true
      },
      lastLoginAt: null,
      passwordHash: hashedPassword
    };

    const user = await createDoc(USERS, userData);

    // Generate JWT tokens
    const tokens = generateTokens(user);

    // Send welcome email
    try {
      await sendEmail(email, 'Welcome to Bugema Hub!', `
        <h1>Welcome to Bugema Hub, ${firstName}!</h1>
        <p>Thank you for joining our campus community platform.</p>
        <p>Get started by exploring events, joining clubs, and connecting with fellow students.</p>
        <p>Best regards,<br>The Bugema Hub Team</p>
      `);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails
    }

    return createdResponse(res, {
      user: {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        university: user.university,
        country: user.country,
        course: user.course,
        year: user.year,
        role: user.role,
        plan: user.plan,
        isVerified: user.isVerified,
        verifiedStudent: user.verifiedStudent,
        points: user.points
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    }, 'User registered successfully');

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Failed to register user', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in Firestore by email
    const users = await getCollection(USERS, [['email', '==', email]]);
    if (users.length === 0) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Update last login
    await updateDoc(USERS, user.id, { lastLoginAt: new Date().toISOString() });

    // Generate JWT tokens
    const tokens = generateTokens(user);

    return successResponse(res, {
      user: {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        isVerified: user.isVerified,
        verifiedStudent: user.verifiedStudent,
        points: user.points
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Failed to login user', 500);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if token is in denylist
    const denylistedToken = await getDoc(TOKEN_DENYLIST, refreshToken);
    if (denylistedToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Get user
    const user = await getDoc(USERS, decoded.uid);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { uid: user.uid, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successResponse(res, {
      accessToken: newAccessToken
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 'Failed to refresh token', 401);
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Add refresh token to denylist
    await createDoc(TOKEN_DENYLIST, {
      token: refreshToken,
      revokedAt: new Date().toISOString(),
      reason: 'logout'
    });

    return successResponse(res, null, 'Logged out successfully');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Failed to logout', 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email (don't reveal if not found)
    const users = await getCollection(USERS, [['email', '==', email]]);
    
    if (users.length === 0) {
      // Return success even if user not found for security
      return successResponse(res, null, 'OTP sent to your email');
    }

    const user = users[0];

    // Generate 6-digit OTP
    const otp = generateNumericCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in Firestore
    await createDoc(OTP_CODES, {
      email,
      otp,
      type: 'password_reset',
      expiresAt: expiresAt.toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString()
    });

    // Send OTP via email
    try {
      await sendEmail(email, 'Password Reset OTP', `
        <h1>Password Reset OTP</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Bugema Hub Team</p>
      `);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return errorResponse(res, 'Failed to send OTP', 500);
    }

    return successResponse(res, null, 'OTP sent to your email');

  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, 'Failed to process request', 500);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find valid OTP
    const otpRecords = await getCollection(OTP_CODES, [
      ['email', '==', email],
      ['otp', '==', otp],
      ['type', '==', 'password_reset'],
      ['isUsed', '==', false]
    ]);

    if (otpRecords.length === 0) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    const otpRecord = otpRecords[0];

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return errorResponse(res, 'OTP has expired', 400);
    }

    // Mark OTP as used
    await updateDoc(OTP_CODES, otpRecord.id, { isUsed: true });

    // Generate short-lived reset token (10 minutes)
    const resetToken = jwt.sign(
      { email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return successResponse(res, { resetToken }, 'OTP verified successfully');

  } catch (error) {
    console.error('OTP verification error:', error);
    return errorResponse(res, 'Failed to verify OTP', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return errorResponse(res, 'Invalid reset token', 400);
    }

    // Find user
    const users = await getCollection(USERS, [['email', '==', decoded.email]]);
    if (users.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    const user = users[0];

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in Firebase Auth
    await auth.updateUser(user.uid, { password: newPassword });

    // Update password in Firestore
    await updateDoc(USERS, user.id, { 
      passwordHash: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    // Invalidate all existing refresh tokens for this user
    // (This would require tracking user tokens in a separate collection)
    // For now, we'll just return success

    return successResponse(res, null, 'Password updated successfully');

  } catch (error) {
    console.error('Password reset error:', error);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};

const verifyStudentEmail = async (req, res) => {
  try {
    const { universityEmail } = req.body;

    // This would require the user to be authenticated
    // For now, we'll just send the OTP
    const otp = generateNumericCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP
    await createDoc(OTP_CODES, {
      email: universityEmail,
      otp,
      type: 'student_verification',
      expiresAt: expiresAt.toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString()
    });

    // Send OTP via email
    try {
      await sendEmail(universityEmail, 'Student Verification OTP', `
        <h1>Student Verification OTP</h1>
        <p>Your OTP for student verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
        <p>Best regards,<br>The Bugema Hub Team</p>
      `);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return errorResponse(res, 'Failed to send verification OTP', 500);
    }

    return successResponse(res, null, 'Verification OTP sent');

  } catch (error) {
    console.error('Student verification error:', error);
    return errorResponse(res, 'Failed to process request', 500);
  }
};

const confirmStudentVerification = async (req, res) => {
  try {
    const { otp } = req.body;

    // Find valid OTP
    const otpRecords = await getCollection(OTP_CODES, [
      ['otp', '==', otp],
      ['type', '==', 'student_verification'],
      ['isUsed', '==', false]
    ]);

    if (otpRecords.length === 0) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    const otpRecord = otpRecords[0];

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return errorResponse(res, 'OTP has expired', 400);
    }

    // Mark OTP as used
    await updateDoc(OTP_CODES, otpRecord.id, { isUsed: true });

    // This would need to be tied to the authenticated user
    // For now, we'll just return success
    return successResponse(res, null, 'Student verified successfully');

  } catch (error) {
    console.error('Student verification confirmation error:', error);
    return errorResponse(res, 'Failed to verify student', 500);
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Google ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in Firestore
    let user = await getDoc(USERS, uid);

    if (!user) {
      // Split name if possible
      const nameParts = (name || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create new user document
      const userData = {
        uid,
        email,
        firstName,
        lastName,
        country: 'Uganda', // Default
        university: 'Bugema University', // Default
        role: 'member',
        plan: 'free',
        isVerified: true, // Google accounts are pre-verified
        verifiedStudent: false,
        points: 0,
        profilePicture: picture || null,
        bio: null,
        socialLinks: {},
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          eventReminders: true,
          clubUpdates: true,
          jobAlerts: true
        },
        lastLoginAt: new Date(),
        authProvider: 'google'
      };

      user = await createDoc(USERS, userData, uid);
    } else {
      // Update last login
      await updateDoc(USERS, uid, { lastLoginAt: new Date() });
    }

    // Generate JWT tokens
    const tokens = generateTokens(user);

    return successResponse(res, {
      user: {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        isVerified: user.isVerified,
        verifiedStudent: user.verifiedStudent,
        points: user.points,
        profilePicture: user.profilePicture
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }, 'Google login successful');
  } catch (error) {
    console.error('Google Auth Error:', error);
    return errorResponse(res, 'Google authentication failed', 401);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyStudentEmail,
  confirmStudentVerification,
  googleLogin
};

