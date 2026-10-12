/**
 * Utilities for serializing and deserializing profile listing filters, search queries,
 * and pagination states to/from URL search params and sessionStorage.
 */

export const DEFAULT_LISTING_STATE = {
  searchQuery: '',
  selectedDistrict: [],
  selectedReligion: 'All',
  selectedCaste: 'All',
  selectedMaritalStatus: 'All',
  selectedEducation: [],
  govtEmployeeFilter: 'All',
  minAge: '18',
  maxAge: '60',
  genderFilter: 'all',
  verifiedOnly: false,
  currentPage: 1
};

/**
 * Parses filter, search and pagination state from a URL search query string (e.g. ?page=3&search=abc)
 * or falls back to sessionStorage if returning from a profile view.
 */
export const parseListingStateFromSearch = (searchString = '', sessionFallback = true) => {
  try {
    const rawSearch = searchString || (typeof window !== 'undefined' ? window.location.search : '');
    const params = new URLSearchParams(rawSearch || '');

    const hasAnyParam =
      params.has('page') ||
      params.has('search') ||
      params.has('gender') ||
      params.has('district') ||
      params.has('religion') ||
      params.has('caste') ||
      params.has('marital') ||
      params.has('edu') ||
      params.has('govt') ||
      params.has('minAge') ||
      params.has('maxAge') ||
      params.has('verified');

    if (hasAnyParam) {
      return {
        searchQuery: params.get('search') || '',
        selectedDistrict: params.get('district')
          ? params.get('district').split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        selectedReligion: params.get('religion') || 'All',
        selectedCaste: params.get('caste') || 'All',
        selectedMaritalStatus: params.get('marital') || 'All',
        selectedEducation: params.get('edu')
          ? params.get('edu').split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        govtEmployeeFilter: params.get('govt') || 'All',
        minAge: params.get('minAge') || '18',
        maxAge: params.get('maxAge') || '60',
        genderFilter: params.get('gender') || 'all',
        verifiedOnly: params.get('verified') === 'true',
        currentPage: Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
      };
    }

    if (sessionFallback && typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem('reshimgath_listing_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            searchQuery: parsed.searchQuery || '',
            selectedDistrict: Array.isArray(parsed.selectedDistrict) ? parsed.selectedDistrict : [],
            selectedReligion: parsed.selectedReligion || 'All',
            selectedCaste: parsed.selectedCaste || 'All',
            selectedMaritalStatus: parsed.selectedMaritalStatus || 'All',
            selectedEducation: Array.isArray(parsed.selectedEducation) ? parsed.selectedEducation : [],
            govtEmployeeFilter: parsed.govtEmployeeFilter || 'All',
            minAge: String(parsed.minAge || '18'),
            maxAge: String(parsed.maxAge || '60'),
            genderFilter: parsed.genderFilter || 'all',
            verifiedOnly: Boolean(parsed.verifiedOnly),
            currentPage: Math.max(1, parseInt(parsed.currentPage || 1, 10) || 1)
          };
        }
      }
    }
  } catch (e) {
    console.warn('Error parsing listing filter state:', e);
  }

  return { ...DEFAULT_LISTING_STATE };
};

/**
 * Serializes filter, search and pagination state into URL query string format
 * (e.g. "?page=3&gender=female&search=p1015")
 */
export const serializeListingStateToQuery = (state) => {
  if (!state || typeof state !== 'object') return '';
  const params = new URLSearchParams();

  if (state.currentPage && Number(state.currentPage) > 1) {
    params.set('page', String(state.currentPage));
  }
  if (state.searchQuery && String(state.searchQuery).trim()) {
    params.set('search', String(state.searchQuery).trim());
  }
  if (state.genderFilter && state.genderFilter !== 'all') {
    params.set('gender', state.genderFilter);
  }
  if (Array.isArray(state.selectedDistrict) && state.selectedDistrict.length > 0) {
    params.set('district', state.selectedDistrict.join(','));
  }
  if (state.selectedReligion && state.selectedReligion !== 'All') {
    params.set('religion', state.selectedReligion);
  }
  if (state.selectedCaste && state.selectedCaste !== 'All') {
    params.set('caste', state.selectedCaste);
  }
  if (state.selectedMaritalStatus && state.selectedMaritalStatus !== 'All') {
    params.set('marital', state.selectedMaritalStatus);
  }
  if (Array.isArray(state.selectedEducation) && state.selectedEducation.length > 0) {
    params.set('edu', state.selectedEducation.join(','));
  }
  if (state.govtEmployeeFilter && state.govtEmployeeFilter !== 'All') {
    params.set('govt', state.govtEmployeeFilter);
  }
  if (state.minAge && String(state.minAge) !== '18') {
    params.set('minAge', String(state.minAge));
  }
  if (state.maxAge && String(state.maxAge) !== '60') {
    params.set('maxAge', String(state.maxAge));
  }
  if (state.verifiedOnly) {
    params.set('verified', 'true');
  }

  const queryStr = params.toString();
  return queryStr ? `?${queryStr}` : '';
};
