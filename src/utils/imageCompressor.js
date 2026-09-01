/**
 * Client-side Image Compression Utility
 * Resizes and compresses uploaded images (JPEG/PNG/WebP) using HTML5 Canvas.
 * Reduces 5MB-10MB raw camera photos to ~30KB-60KB Base64 Data URLs.
 * Ensures images fit comfortably in Firestore (1MB limit) & localStorage (5MB limit).
 *
 * @param {File} file - Uploaded File object
 * @param {number} maxWidth - Maximum width (default 600px)
 * @param {number} maxHeight - Maximum height (default 600px)
 * @param {number} quality - Compression quality 0.0 to 1.0 (default 0.75)
 * @returns {Promise<string>} Compressed Base64 Data URL
 */
export const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw image onto canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D context from canvas'));
          return;
        }

        // Smoothing for optimal quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed JPEG Data URL
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};
