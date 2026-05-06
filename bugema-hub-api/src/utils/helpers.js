const crypto = require('crypto');
const moment = require('moment');

// Date formatting utilities
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

const formatTime = (date, format = 'HH:mm') => {
  return moment(date).format(format);
};

const formatRelativeTime = (date) => {
  return moment(date).fromNow();
};

const isDateInPast = (date) => {
  return moment(date).isBefore(moment());
};

const isDateInFuture = (date) => {
  return moment(date).isAfter(moment());
};

const addDaysToDate = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

const subtractDaysFromDate = (date, days) => {
  return moment(date).subtract(days, 'days').toDate();
};

// String utilities
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const capitalizeWords = (text) => {
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

const truncate = (text, length = 100, suffix = '...') => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length - suffix.length) + suffix;
};

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

const stripHtml = (html) => {
  return html.replace(/<[^>]*>/g, '');
};

const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateNumericCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
};

const generateAlphanumericCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Array utilities
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const removeDuplicates = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'desc') {
      return b[key] > a[key] ? 1 : -1;
    }
    return a[key] > b[key] ? 1 : -1;
  });
};

// Object utilities
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj && obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

const isEmpty = (value) => {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

// Validation utilities
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// File utilities
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

const getFileName = (filepath) => {
  return filepath.split('\\').pop().split('/').pop();
};

const getFileSizeInMB = (bytes) => {
  return bytes / (1024 * 1024);
};

const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

const isDocumentFile = (filename) => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const extension = getFileExtension(filename);
  return documentExtensions.includes(extension);
};

// Pagination utilities
const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex
  };
};

const getPaginationQuery = (page = 1, limit = 20, maxLimit = 100) => {
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit)));
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset
  };
};

// Search utilities
const createSearchRegex = (searchTerm) => {
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm, 'i');
};

const fuzzySearch = (text, searchTerm, threshold = 0.6) => {
  const textLower = text.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  if (textLower.includes(searchLower)) {
    return 1.0;
  }
  
  // Simple Levenshtein distance approximation
  let matches = 0;
  const searchLength = searchLower.length;
  
  for (let i = 0; i < searchLength; i++) {
    if (textLower.includes(searchLower[i])) {
      matches++;
    }
  }
  
  const similarity = matches / searchLength;
  return similarity >= threshold ? similarity : 0;
};

// Color utilities
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const generateRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};

// Location utilities
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const isWithinRadius = (lat1, lon1, lat2, lon2, radius) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radius;
};

// Cache utilities
const createCache = (ttl = 300000) => { // 5 minutes default TTL
  const cache = new Map();
  
  return {
    set: (key, value) => {
      cache.set(key, {
        value,
        expiry: Date.now() + ttl
      });
    },
    get: (key) => {
      const item = cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }
      
      return item.value;
    },
    delete: (key) => {
      cache.delete(key);
    },
    clear: () => {
      cache.clear();
    },
    size: () => {
      return cache.size;
    }
  };
};

// Rate limiting utilities
const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return {
    isAllowed: (identifier) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier);
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
      requests.set(identifier, validRequests);
      
      if (validRequests.length >= maxRequests) {
        return false;
      }
      
      validRequests.push(now);
      return true;
    },
    reset: (identifier) => {
      if (identifier) {
        requests.delete(identifier);
      } else {
        requests.clear();
      }
    }
  };
};

module.exports = {
  // Date utilities
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  isDateInPast,
  isDateInFuture,
  addDaysToDate,
  subtractDaysFromDate,
  
  // String utilities
  slugify,
  capitalize,
  capitalizeWords,
  truncate,
  escapeHtml,
  stripHtml,
  generateRandomString,
  generateNumericCode,
  generateAlphanumericCode,
  
  // Array utilities
  shuffleArray,
  chunkArray,
  removeDuplicates,
  sortByKey,
  
  // Object utilities
  pick,
  omit,
  isEmpty,
  deepClone,
  mergeObjects,
  
  // Validation utilities
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidUUID,
  isStrongPassword,
  
  // File utilities
  getFileExtension,
  getFileName,
  getFileSizeInMB,
  isImageFile,
  isDocumentFile,
  
  // Pagination utilities
  calculatePagination,
  getPaginationQuery,
  
  // Search utilities
  createSearchRegex,
  fuzzySearch,
  
  // Color utilities
  hexToRgb,
  rgbToHex,
  generateRandomColor,
  
  // Location utilities
  calculateDistance,
  isWithinRadius,
  
  // Cache utilities
  createCache,
  
  // Rate limiting utilities
  createRateLimiter
};
