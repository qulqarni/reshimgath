/**
 * Terms of Use & Community Safety Rules Enforcement Utility
 * Version: 2026.1
 */

export const CURRENT_TERMS_VERSION = '2026.1';
export const TERMS_LAST_UPDATED = 'October 2026';

/**
 * Checks whether a user has explicitly accepted the current version of Terms of Use
 * @param {object|null} user - The current user object
 * @param {string} targetVersion - The required version string
 * @returns {boolean}
 */
export const hasAcceptedTerms = (user, targetVersion = CURRENT_TERMS_VERSION) => {
  if (!user) return false;
  // If user has termsAcceptedVersion equal to current version and a recorded timestamp
  const version = user.termsAcceptedVersion || user.terms_version;
  const acceptedAt = user.termsAcceptedAt || user.terms_accepted_at;
  return Boolean(version && String(version) === String(targetVersion) && acceptedAt);
};

/**
 * Creates a standardized terms acceptance record object
 * @param {string} userId - ID of the user accepting the terms
 * @param {string} version - Version of the terms
 * @returns {object}
 */
export const createTermsAcceptanceRecord = (userId, version = CURRENT_TERMS_VERSION) => {
  const timestampIso = new Date().toISOString();
  return {
    termsAcceptedVersion: version,
    termsAcceptedAt: timestampIso,
    termsAcceptedUserId: userId || 'anonymous',
    termsAcceptedServerTimestamp: Date.now()
  };
};

/**
 * Validates whether user is authorized to upload media or publish content
 * Throws an Error if terms acceptance is missing
 * @param {object} user - User object
 * @param {string} actionName - Name of action being attempted (e.g. 'upload photos')
 */
export const validateTermsAcceptanceForAction = (user, actionName = 'upload media or publish content') => {
  if (!hasAcceptedTerms(user)) {
    const error = new Error(`TERMS_ACCEPTANCE_REQUIRED: You must explicitly accept the Terms of Use and Community Safety Rules before you can ${actionName}.`);
    error.code = 'TERMS_NOT_ACCEPTED';
    error.requiredVersion = CURRENT_TERMS_VERSION;
    throw error;
  }
  return true;
};
