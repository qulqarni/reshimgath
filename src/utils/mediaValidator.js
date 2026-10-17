/**
 * Media File & Security Validator
 * Validates file upload MIME types, extensions, size limits, and user permissions
 * Complies with Google Play developer policies and OWASP file upload security guidelines.
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const ALLOWED_BIODATA_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_BIODATA_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

// File size limits in bytes
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_BIODATA_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Format bytes to human readable format (MB / KB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract clean lowercase file extension from filename
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  const idx = filename.lastIndexOf('.');
  return idx !== -1 ? filename.slice(idx).toLowerCase() : '';
};

/**
 * Sanitize a filename to prevent path traversal or unsafe characters
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'upload';
  const ext = getFileExtension(filename);
  const baseName = filename.slice(0, filename.length - ext.length);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  return `${cleanBase}${ext}`;
};

/**
 * Validate an image file for profile photos, gallery media, or story pictures
 * @param {File} file - Browser File object
 * @param {Object} options - Custom validation options
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateImageFile = (file, options = {}) => {
  const maxSize = options.maxSize || MAX_PHOTO_SIZE_BYTES;
  const allowedTypes = options.allowedTypes || ALLOWED_IMAGE_TYPES;
  const allowedExtensions = options.allowedExtensions || ALLOWED_IMAGE_EXTENSIONS;

  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  // 1. Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds the allowed limit of ${formatFileSize(maxSize)}. Your file is ${formatFileSize(file.size)}.`
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty (0 bytes).' };
  }

  // 2. Check MIME type
  const mimeType = (file.type || '').toLowerCase();
  const ext = getFileExtension(file.name);

  const hasValidMime = mimeType && allowedTypes.includes(mimeType);
  const hasValidExt = ext && allowedExtensions.includes(ext);

  if (!hasValidMime && !hasValidExt) {
    return {
      isValid: false,
      error: `Unsupported image format. Please upload JPG, PNG, or WEBP photos (received: ${mimeType || ext || 'unknown'}).`
    };
  }

  // Prevent SVG or executable scripts masked as images
  const blockedExtensions = ['.svg', '.html', '.htm', '.js', '.exe', '.sh', '.php', '.bat', '.cmd'];
  if (blockedExtensions.includes(ext) || mimeType.includes('svg') || mimeType.includes('html')) {
    return {
      isValid: false,
      error: 'Security warning: Scalable vector graphics (SVG) and script files are not allowed.'
    };
  }

  return { isValid: true };
};

/**
 * Validate a biodata file (PDF or scanned high-res image)
 * @param {File} file - Browser File object
 * @param {Object} options - Custom validation options
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateBiodataFile = (file, options = {}) => {
  const maxSize = options.maxSize || MAX_BIODATA_SIZE_BYTES;

  if (!file) {
    return { isValid: false, error: 'No biodata document provided.' };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Biodata file exceeds the limit of ${formatFileSize(maxSize)}. Your file is ${formatFileSize(file.size)}.`
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty (0 bytes).' };
  }

  const mimeType = (file.type || '').toLowerCase();
  const ext = getFileExtension(file.name);

  const isValidMime = mimeType && ALLOWED_BIODATA_TYPES.includes(mimeType);
  const isValidExt = ext && ALLOWED_BIODATA_EXTENSIONS.includes(ext);

  if (!isValidMime && !isValidExt) {
    return {
      isValid: false,
      error: `Invalid biodata format. Please upload a PDF document or JPG/PNG image of your biodata.`
    };
  }

  return { isValid: true };
};

/**
 * Verify upload permissions: Normal users can only upload media for their own account
 * Admins are authorized to upload media on behalf of any candidate profile
 * @param {string} targetUserId - The ID of the profile receiving the upload
 * @param {Object|null} currentUser - The currently authenticated user object
 * @returns {{ isAuthorized: boolean, reason?: string }}
 */
export const verifyUploadPermission = (targetUserId, currentUser) => {
  if (!targetUserId) {
    return { isAuthorized: false, reason: 'Target profile ID is missing.' };
  }

  // If no user is logged in
  if (!currentUser) {
    return { isAuthorized: false, reason: 'Authentication required. Please log in to upload files.' };
  }

  // Admins can manage any profile
  const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;
  if (isAdmin) {
    return { isAuthorized: true };
  }

  // Profile owners can upload only to their own profile
  const isOwner = String(currentUser.id) === String(targetUserId) || 
                  String(currentUser.uid) === String(targetUserId);

  if (isOwner) {
    return { isAuthorized: true };
  }

  return {
    isAuthorized: false,
    reason: 'Permission denied: You do not have permission to upload files for another member.'
  };
};
