/**
 * Accurately calculates age from a Date of Birth string (YYYY-MM-DD, ISO, or Date).
 * Handles leap years, month differences, and day-of-month boundaries.
 * Returns age as a string (e.g. "25") or empty string if invalid.
 *
 * @param {string|Date} dob - The date of birth
 * @returns {string} The calculated age in years, or empty string if invalid
 */
export const calculateAgeFromDob = (dob) => {
  if (!dob) return '';

  let birthYear, birthMonth, birthDay;

  if (typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dob)) {
    const parts = dob.split('T')[0].split('-');
    birthYear = parseInt(parts[0], 10);
    birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
    birthDay = parseInt(parts[2], 10);
  } else {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '';
    birthYear = birthDate.getFullYear();
    birthMonth = birthDate.getMonth();
    birthDay = birthDate.getDate();
  }

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return '';

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }

  return age >= 0 ? String(age) : '';
};
