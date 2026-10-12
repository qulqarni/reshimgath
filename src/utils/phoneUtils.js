/**
 * Utility functions for Indian & international phone number normalization and matching
 */

/**
 * Strips non-digit characters and extracts standard 10-digit number.
 * e.g., "+91 98220 00000" -> "9822000000"
 * "09822000000" -> "9822000000"
 * "9822000000" -> "9822000000"
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  const digitsOnly = String(phone).replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 10) {
    return digitsOnly.slice(-10);
  }
  return digitsOnly;
};

/**
 * Checks if two phone numbers are effectively the same mobile number.
 */
export const isSamePhoneNumber = (phone1, phone2) => {
  if (!phone1 || !phone2) return false;
  const raw1 = String(phone1).trim();
  const raw2 = String(phone2).trim();
  if (!raw1 || !raw2) return false;

  // Direct case-insensitive string match
  if (raw1.toLowerCase() === raw2.toLowerCase()) return true;

  // Normalized 10-digit comparison
  const norm1 = normalizePhoneNumber(raw1);
  const norm2 = normalizePhoneNumber(raw2);

  if (norm1 && norm2 && norm1.length >= 10 && norm2.length >= 10) {
    return norm1 === norm2;
  }

  // Exact digits comparison if < 10 digits
  const digits1 = raw1.replace(/[^0-9]/g, '');
  const digits2 = raw2.replace(/[^0-9]/g, '');
  if (digits1 && digits2 && digits1 === digits2) {
    return true;
  }

  return false;
};

/**
 * Extracts all possible phone fields from a profile object.
 */
export const getProfilePhoneNumbers = (profile) => {
  if (!profile || typeof profile !== 'object') return [];
  const candidates = [
    profile.phone,
    profile.mobile,
    profile.contactNumber,
    profile.contact,
    profile.whatsapp,
    profile.phoneNumber,
    profile.telephone,
    profile.contact_number,
    profile.contact_phone
  ];
  return candidates.filter((val) => val && typeof val === 'string' && val.trim().length > 0);
};

/**
 * Checks if a given phone number matches any phone number in a profile object.
 */
export const doesProfileHavePhone = (profile, phoneToMatch) => {
  if (!profile || !phoneToMatch) return false;
  const phones = getProfilePhoneNumbers(profile);
  return phones.some((p) => isSamePhoneNumber(p, phoneToMatch));
};
