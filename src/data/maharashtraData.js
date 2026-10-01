export const DISTRICTS = [
  'Sangli/सांगली',
  'Kolhapur/कोल्हापूर',
  'Satara/सातारा',
  'Solapur/सोलापूर',
  'Pune/पुणे',
  'Mumbai/मुंबई',
  'Thane/ठाणे',
  'Raigad/रायगड',
  'Palghar/पालघर',
  'Ratnagiri/रत्नागिरी',
  'Sindhudurg/सिंधुदुर्ग',
  'Belgaum/बेळगाव',
  'Dharwad/धारवाड',
  'Vijapur/विजापूर',
  'Bangalore/बेंगलोर',
  'Goa/गोवा',
  'KARNATAKA/कर्नाटक',
  'GUJARAT/गुजरात',
  'MADHYAPRADESH/मध्यप्रदेश',
  'ANDHRA PRADESH/आंध्रप्रदेश',
  'TAMILNADU/तामिळनाडू',
  'WEST BENGAL/पश्चिम बंगाल',
  'DELHI/दिल्ली',
  'OTHER',
  'Jalgaon/जळगाव',
  'DHULE/धुळे',
  'Nandurbar/नंदुरबार',
  'Nashik/नाशिक',
  'Ahmednagar/अहमदनगर',
  'Aurangabad/औरंगाबाद',
  'Jalna/जालना',
  'Parbhani/परभणी',
  'Hingoli/हिंगोली',
  'Nanded/नांदेड',
  'Latur/लातूर',
  'Usmanabad/उस्मानाबाद',
  'Beed/बीड',
  'Buldhana/बुलढाणा',
  'Akola/अकोला',
  'Washim/वाशिम',
  'Amravati/अमरावती',
  'Yavatmal/यवतमाळ',
  'Vardha/वर्धा',
  'Nagpur/नागपूर',
  'Bhandara/भंडारा',
  'Gondia/गोंदिया',
  'Chandrapur/चंद्रपूर',
  'Gadchiroli/गडचिरोली'
];

export const MAHARASHTRA_DISTRICTS = DISTRICTS;

/**
 * Normalizes any legacy or variant district string to the standard bilingual option.
 * E.g., 'Kolhapur' -> 'Kolhapur/कोल्हापूर', 'Pune' -> 'Pune/पुणे'
 */
export const normalizeDistrict = (district) => {
  if (!district || typeof district !== 'string') return '';
  const trimmed = district.trim();
  if (!trimmed) return '';

  // 1. Direct match with standard list
  const direct = DISTRICTS.find(d => d.toLowerCase() === trimmed.toLowerCase());
  if (direct) return direct;

  // 2. Match English part before '/'
  const englishPart = trimmed.split('/')[0].trim().toLowerCase();
  const byEnglish = DISTRICTS.find(d => d.split('/')[0].trim().toLowerCase() === englishPart);
  if (byEnglish) return byEnglish;

  // 3. Match Marathi part after '/'
  if (trimmed.includes('/')) {
    const marathiPart = trimmed.split('/')[1].trim();
    if (marathiPart) {
      const byMarathi = DISTRICTS.find(d => d.includes('/') && d.split('/')[1].trim() === marathiPart);
      if (byMarathi) return byMarathi;
    }
  }

  // 4. Handle legacy variations
  const lower = trimmed.toLowerCase();
  if (lower.includes('mumbai')) return 'Mumbai/मुंबई';
  if (lower.includes('ahmednagar') || lower.includes('ahilyanagar')) return 'Ahmednagar/अहमदनगर';
  if (lower.includes('aurangabad') || lower.includes('sambhajinagar')) return 'Aurangabad/औरंगाबाद';
  if (lower.includes('osmanabad') || lower.includes('dharashiv') || lower.includes('usmanabad')) return 'Usmanabad/उस्मानाबाद';
  if (lower.includes('wardha') || lower.includes('vardha')) return 'Vardha/वर्धा';
  if (lower.includes('dhule')) return 'DHULE/धुळे';
  if (lower.includes('karnataka')) return 'KARNATAKA/कर्नाटक';
  if (lower.includes('gujarat')) return 'GUJARAT/गुजरात';
  if (lower.includes('madhya') || lower.includes('madhyapradesh')) return 'MADHYAPRADESH/मध्यप्रदेश';
  if (lower.includes('andhra')) return 'ANDHRA PRADESH/आंध्रप्रदेश';
  if (lower.includes('tamil') || lower.includes('tamilnadu')) return 'TAMILNADU/तामिळनाडू';
  if (lower.includes('bengal') || lower.includes('west bengal')) return 'WEST BENGAL/पश्चिम बंगाल';
  if (lower.includes('delhi')) return 'DELHI/दिल्ली';
  if (lower === 'other') return 'OTHER';

  // 5. Partial token match
  const partial = DISTRICTS.find(d => {
    const dEng = d.split('/')[0].trim().toLowerCase();
    return dEng && (dEng === lower || lower.includes(dEng) || dEng.includes(lower));
  });
  if (partial) return partial;

  return trimmed;
};

export const MAHARASHTRA_COMMUNITIES = [
  'Maratha',
  'Brahmin (Deshastha / Kokanastha)',
  'Buddhist',
  'Matang',
  'Lingayat',
  'Jain (Digambar / Shwetambar)',
  'Dhangar',
  'Mali',
  'Chambhar',
  'Agri / Koli',
  'Sonar (Daivadnya)',
  'CKP (Chandraseniya Kayastha Prabhu)',
  'Banjara',
  'Vani / Vaishya',
  'Sutar / Vishwakarma',
  'Gowari',
  'Other'
];

export const RELIGIONS = [
  'Hindu',
  'Jain',
  'Buddhist',
  'Christian',
  'Other'
];

export const EDUCATION_LEVELS = [
  'B.E. / B.Tech',
  'M.E. / M.Tech',
  'MBA / PGDM',
  'MBBS / MD / MS',
  'BAMS/BHMS',
  'BDS / MDS',
  'B.Pharm / M.Pharm',
  'CA / CS / CFA',
  'B.Com / M.Com',
  'B.Sc / M.Sc',
  'B.Arch / M.Arch',
  'LL.B / LL.M',
  'Ph.D / Doctorate',
  'Diploma / Technical',
  'Other'
];

export const OCCUPATIONS = [
  'Software Engineer / IT Professional',
  'Doctor / Healthcare Specialist',
  'Civil Servant / Govt Officer (MPSC / UPSC)',
  'Chartered Accountant / Financial Analyst',
  'Business Owner / Entrepreneur',
  'Architect / Interior Designer',
  'Professor / Lecturer',
  'Banker / Financial Manager',
  'Mechanical / Civil Engineer',
  'Lawyer / Legal Advocate',
  'Pharmacist / Biotech Researcher',
  'Corporate Manager',
  'Agriculture Specialist / Farmer',
  'Other'
];

export const INCOME_RANGES = [
  'Disclose later',
  'Under ₹ 3 Lakhs per annum',
  '₹ 3 - 5 Lakhs per annum',
  '₹ 5 - 8 Lakhs per annum',
  '₹ 8 - 12 Lakhs per annum',
  '₹ 12 - 18 Lakhs per annum',
  '₹ 18 - 25 Lakhs per annum',
  '₹ 25 - 40 Lakhs per annum',
  '₹ 40+ Lakhs per annum'
];

export const HEIGHT_OPTIONS = [
  '4\' 0" (121 cm)',
  '4\' 1" (124 cm)',
  '4\' 2" (127 cm)',
  '4\' 3" (129 cm)',
  '4\' 4" (132 cm)',
  '4\' 5" (134 cm)',
  '4\' 6" (137 cm)',
  '4\' 7" (139 cm)',
  '4\' 8" (142 cm)',
  '4\' 9" (144 cm)',
  '4\' 10" (147 cm)',
  '4\' 11" (149 cm)',
  '5\' 0" (152 cm)',
  '5\' 1" (154 cm)',
  '5\' 2" (157 cm)',
  '5\' 3" (160 cm)',
  '5\' 4" (162 cm)',
  '5\' 5" (165 cm)',
  '5\' 6" (168 cm)',
  '5\' 7" (170 cm)',
  '5\' 8" (172 cm)',
  '5\' 9" (175 cm)',
  '5\' 10" (178 cm)',
  '5\' 11" (180 cm)',
  '6\' 0" (183 cm)',
  '6\' 1" (185 cm)',
  '6\' 2" (187 cm)'
];
