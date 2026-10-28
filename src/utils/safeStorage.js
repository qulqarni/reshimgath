/**
 * safeStorage.js
 * Resilient, quota-aware localStorage wrapper for Sambodhi Sarang Matrimony.
 * Prevents QuotaExceededError and keeps storage footprint well under the 5MB browser limit.
 */

// Max number of cached items to prevent unbounded growth in localStorage
const MAX_CACHED_PROFILES = 40;
const MAX_CACHED_VIEWS = 40;
const MAX_CACHED_NOTIFICATIONS = 40;

/**
 * Sanitizes an array of profiles to lightweight stubs for offline cache.
 * Strips huge base64 strings or unnecessary deep data while keeping essential card fields.
 */
export const sanitizeProfilesForCache = (profiles) => {
  if (!Array.isArray(profiles)) return [];
  return profiles.slice(0, MAX_CACHED_PROFILES).map((p) => {
    if (!p || typeof p !== 'object') return p;
    // Don't cache giant base64 photos in localStorage (Cloud URLs are fine)
    const safePhoto = (p.photo && typeof p.photo === 'string' && p.photo.startsWith('data:'))
      ? ''
      : (p.photo || '');

    return {
      id: p.id,
      name: p.name || '',
      gender: p.gender || '',
      age: p.age || '',
      dob: p.dob || '',
      caste: p.caste || '',
      subcaste: p.subcaste || '',
      education: p.education || '',
      occupation: p.occupation || '',
      city: p.city || '',
      district: p.district || '',
      photo: safePhoto,
      isVerified: Boolean(p.isVerified),
      createdAt: p.createdAt || '',
      updatedAt: p.updatedAt || '',
      planId: p.planId || '',
      membership: p.membership || ''
    };
  });
};

/**
 * Frees up localStorage space by evicting oversized/stale cache data
 */
export const evictStorageQuota = () => {
  try {
    // 1. Trim profile views to recent items only
    const viewsRaw = localStorage.getItem('reshimgath_profile_views');
    if (viewsRaw) {
      try {
        const views = JSON.parse(viewsRaw);
        if (Array.isArray(views) && views.length > MAX_CACHED_VIEWS) {
          localStorage.setItem('reshimgath_profile_views', JSON.stringify(views.slice(-MAX_CACHED_VIEWS)));
        }
      } catch (e) {
        localStorage.removeItem('reshimgath_profile_views');
      }
    }

    // 2. Trim notifications to recent items only
    const notifsRaw = localStorage.getItem('reshimgath_notifications');
    if (notifsRaw) {
      try {
        const notifs = JSON.parse(notifsRaw);
        if (Array.isArray(notifs) && notifs.length > MAX_CACHED_NOTIFICATIONS) {
          localStorage.setItem('reshimgath_notifications', JSON.stringify(notifs.slice(-MAX_CACHED_NOTIFICATIONS)));
        }
      } catch (e) {
        localStorage.removeItem('reshimgath_notifications');
      }
    }

    // 3. Trim profiles cache if too large
    const profilesRaw = localStorage.getItem('reshimgath_profiles');
    if (profilesRaw && profilesRaw.length > 500000) { // > 500KB
      try {
        const profiles = JSON.parse(profilesRaw);
        const slim = sanitizeProfilesForCache(profiles);
        localStorage.setItem('reshimgath_profiles', JSON.stringify(slim));
      } catch (e) {
        localStorage.removeItem('reshimgath_profiles');
      }
    }
  } catch (err) {
    // Silently ignore storage eviction errors
  }
};

/**
 * Safely sets an item in localStorage without throwing QuotaExceededError
 * @param {string} key - Storage key
 * @param {any} value - Value to store (string or JSON-serializable object)
 * @returns {boolean} - True if successfully stored, false otherwise
 */
export const safeSetItem = (key, value) => {
  try {
    let strValue = typeof value === 'string' ? value : JSON.stringify(value);

    // If setting profiles, sanitize to prevent giant base64 and trim to top entries
    if (key === 'reshimgath_profiles' && Array.isArray(value)) {
      strValue = JSON.stringify(sanitizeProfilesForCache(value));
    } else if (key === 'reshimgath_profile_views' && Array.isArray(value)) {
      strValue = JSON.stringify(value.slice(-MAX_CACHED_VIEWS));
    } else if (key === 'reshimgath_notifications' && Array.isArray(value)) {
      strValue = JSON.stringify(value.slice(-MAX_CACHED_NOTIFICATIONS));
    }

    localStorage.setItem(key, strValue);
    return true;
  } catch (error) {
    // If quota exceeded, clean up and try one more time
    if (
      error &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22 ||
        error.code === 1014)
    ) {
      evictStorageQuota();
      try {
        // If it's still profiles, save even smaller slice
        if (key === 'reshimgath_profiles') {
          const minimal = Array.isArray(value) ? sanitizeProfilesForCache(value).slice(0, 15) : [];
          localStorage.setItem(key, JSON.stringify(minimal));
          return true;
        }
        let retryValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, retryValue);
        return true;
      } catch (retryError) {
        // Graceful non-crashing fallback
        return false;
      }
    }
    return false;
  }
};

/**
 * Safely retrieves and optionally parses an item from localStorage
 */
export const safeGetItem = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return raw;
  } catch (e) {
    return fallback;
  }
};
