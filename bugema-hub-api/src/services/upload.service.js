const { cloudinary } = require('../config/cloudinary');
const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

// Supported folders
const SUPPORTED_FOLDERS = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  POSTS: 'posts',
  MARKETPLACE: 'marketplace',
  RESOURCES: 'resources',
  CLUBS: 'clubs',
  EVENTS: 'events',
  GENERAL: 'general'
};

/**
 * Upload image to Cloudinary
 * @param {Object} file - File object with path, originalname, mimetype, size
 * @param {string} folder - Target folder (from SUPPORTED_FOLDERS)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
const uploadImage = async (file, folder = SUPPORTED_FOLDERS.GENERAL) => {
  try {
    // Validate folder
    if (!Object.values(SUPPORTED_FOLDERS).includes(folder)) {
      throw new Error(`Unsupported folder: ${folder}`);
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: `bugema-hub/${folder}`,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      format: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      createdAt: result.created_at,
      folder
    };
  } catch (error) {
    console.error('Failed to upload image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload PDF to Cloudinary
 * @param {Object} file - File object with path, originalname, mimetype, size
 * @param {string} folder - Target folder (from SUPPORTED_FOLDERS)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
const uploadPDF = async (file, folder = SUPPORTED_FOLDERS.RESOURCES) => {
  try {
    // Validate folder
    if (!Object.values(SUPPORTED_FOLDERS).includes(folder)) {
      throw new Error(`Unsupported folder: ${folder}`);
    }

    // Validate file type (PDF only)
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Invalid file type. Only PDF files are allowed.');
    }

    // Validate file size (max 50MB for PDFs)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 50MB.');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: `bugema-hub/${folder}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      format: 'pdf',
      pages: true
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      pageCount: result.pages || 1,
      createdAt: result.created_at,
      folder
    };
  } catch (error) {
    console.error('Failed to upload PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type ('image' or 'auto')
 * @returns {Promise<Object>} Deletion result
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } else {
      return {
        success: false,
        error: 'Failed to delete file',
        result: result.result
      };
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload user avatar
 * @param {Object} file - File object
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
const uploadAvatar = async (file, userId) => {
  try {
    const result = await uploadImage(file, SUPPORTED_FOLDERS.AVATARS);
    
    if (result.success) {
      // Update user profile in Firestore
      await db.collection('users').doc(userId).update({
        profilePicture: result.url,
        profilePicturePublicId: result.publicId,
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload user cover photo
 * @param {Object} file - File object
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
const uploadCover = async (file, userId) => {
  try {
    const result = await uploadImage(file, SUPPORTED_FOLDERS.COVERS);
    
    if (result.success) {
      // Update user profile in Firestore
      await db.collection('users').doc(userId).update({
        coverPhoto: result.url,
        coverPhotoPublicId: result.publicId,
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to upload cover photo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload post images
 * @param {Array} files - Array of file objects
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Upload result
 */
const uploadPostImages = async (files, postId) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, SUPPORTED_FOLDERS.POSTS));
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads.length > 0) {
      // Update post with image URLs
      await db.collection('posts').doc(postId).update({
        images: successfulUploads.map(result => ({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height
        })),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return {
      success: failedUploads.length === 0,
      files: successfulUploads,
      errors: failedUploads.map(result => result.error)
    };
  } catch (error) {
    console.error('Failed to upload post images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload marketplace images
 * @param {Array} files - Array of file objects
 * @param {string} listingId - Marketplace listing ID
 * @returns {Promise<Object>} Upload result
 */
const uploadMarketplaceImages = async (files, listingId) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, SUPPORTED_FOLDERS.MARKETPLACE));
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads.length > 0) {
      // Update marketplace listing with image URLs
      await db.collection('marketplace').doc(listingId).update({
        images: successfulUploads.map(result => ({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height
        })),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return {
      success: failedUploads.length === 0,
      files: successfulUploads,
      errors: failedUploads.map(result => result.error)
    };
  } catch (error) {
    console.error('Failed to upload marketplace images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload resource files
 * @param {Object} file - File object
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Upload result
 */
const uploadResourceFile = async (file, resourceId) => {
  try {
    let result;
    
    // Check if it's a PDF
    if (file.mimetype === 'application/pdf') {
      result = await uploadPDF(file, SUPPORTED_FOLDERS.RESOURCES);
    } else {
      // Try as image
      result = await uploadImage(file, SUPPORTED_FOLDERS.RESOURCES);
    }
    
    if (result.success) {
      // Update resource with file info
      await db.collection('resources').doc(resourceId).update({
        file: {
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          size: result.size,
          pageCount: result.pageCount,
          width: result.width,
          height: result.height,
          folder: result.folder
        },
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to upload resource file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload club logo
 * @param {Object} file - File object
 * @param {string} clubId - Club ID
 * @returns {Promise<Object>} Upload result
 */
const uploadClubLogo = async (file, clubId) => {
  try {
    const result = await uploadImage(file, SUPPORTED_FOLDERS.CLUBS);
    
    if (result.success) {
      // Update club with logo URL
      await db.collection('clubs').doc(clubId).update({
        logo: result.url,
        logoPublicId: result.publicId,
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to upload club logo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate file before upload
 * @param {Object} file - File object
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
const validateFile = (file, allowedTypes, maxSize) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
};

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} File information
 */
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);

    return {
      success: true,
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
        resourceType: result.resource_type
      }
    };
  } catch (error) {
    console.error('Failed to get file info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  // Main upload functions
  uploadImage,
  uploadPDF,
  deleteFile,
  
  // Specific upload functions
  uploadAvatar,
  uploadCover,
  uploadPostImages,
  uploadMarketplaceImages,
  uploadResourceFile,
  uploadClubLogo,
  
  // Utility functions
  validateFile,
  getFileInfo,
  
  // Constants
  SUPPORTED_FOLDERS
};
