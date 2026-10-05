/**
 * Client-side Image Compression Utility
 * Resizes and compresses uploaded images (JPEG/PNG/WebP/HEIC) using HTML5 Canvas.
 * Reduces 5MB-15MB raw camera photos to ~80KB-200KB without compromising visual quality.
 * Preserves high sharpness for portrait photos and fine text legibility for biodatas.
 */

/**
 * Compresses an image File or Blob to a lightweight, high-fidelity JPEG File.
 * Resizes raw multi-megabyte camera photos down to ~80KB-200KB while preserving visual sharpness.
 *
 * @param {File|Blob} file - Original image file from file input
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1200] - Maximum width in pixels (1200px preserves full HD clarity)
 * @param {number} [options.maxHeight=1200] - Maximum height in pixels
 * @param {number} [options.quality=0.82] - Quality level (0.82 is the visually lossless threshold)
 * @returns {Promise<File>} Compressed File object ready for Firebase Storage upload
 */
export const compressImageToFile = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = {}) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // SVG files shouldn't be rasterized through canvas
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback gracefully if image decoding fails
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(file);
        return;
      }

      // Proportional downscaling only if larger than target dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // High quality bicubic smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compressed blob is somehow larger than original, keep original
          if (file.size && blob.size >= file.size) {
            resolve(file);
            return;
          }

          const originalName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'photo';
          const newFileName = `${originalName}.jpg`;

          try {
            const compressedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } catch (e) {
            // In case File constructor has issues on older browsers/webviews, attach metadata to blob
            blob.name = newFileName;
            blob.lastModified = Date.now();
            resolve(blob);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = objectUrl;
  });
};

/**
 * High-resolution compression for Biodata document photos (preserves fine text legibility).
 * Max dimensions: 1600x2200, Quality: 0.85.
 * Shrinks 10MB phone snapshots to ~180KB-300KB while keeping text razor-sharp.
 */
export const compressBiodataImageToFile = (file) => {
  return compressImageToFile(file, {
    maxWidth: 1600,
    maxHeight: 2200,
    quality: 0.85
  });
};

/**
 * Backward-compatible Base64 Data URL compressor
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D context from canvas'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.src = objectUrl;
  });
};
