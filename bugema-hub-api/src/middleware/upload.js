const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Single file upload middleware
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple
};
