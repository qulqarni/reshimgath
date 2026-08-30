import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, EDUCATION_LEVELS, OCCUPATIONS, INCOME_RANGES } from '../data/maharashtraData';
import { BiodataPdfSection } from '../components/profile/BiodataPdfSection';

export const ProfileSetupPage = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dob: user?.dob || '1998-06-15',
    height: user?.height || '5\' 6" (168 cm)',
    maritalStatus: 'Never Married',
    religion: 'Hindu',
    caste: user?.caste || 'Maratha',
    motherTongue: 'Marathi',
    bloodGroup: 'O+',
    state: 'Maharashtra',
    district: user?.district || 'Pune',
    city: 'Kothrud, Pune',
    nativePlace: 'Satara / Sangli',
    education: 'B.E. / B.Tech',
    college: 'COEP Pune',
    occupation: 'Software Engineer / IT Professional',
    company: 'Leading Tech Company',
    income: '₹ 12 - 18 Lakhs per annum',
    fatherOccupation: 'Government Servant / Business Owner',
    motherOccupation: 'Homemaker',
    siblings: '1 Brother',
    familyType: 'Nuclear Family',
    diet: 'Vegetarian',
    smoking: 'No',
    drinking: 'No',
    hobbies: 'Music, Trekking, Classical Art',
    aboutMe: 'I am a family-oriented Maharashtrian professional. I balance modern tech aspirations with cultural warmth.',
    prefAge: '24 - 29',
    prefHeight: '5\' 2" - 5\' 8"',
    prefDistrict: 'Pune, Mumbai, Kolhapur'
  });

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      updateProfile(formData);
      onNavigate('/dashboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-2xl p-6 sm:p-10 space-y-8">
        
        {/* Header & Step Indicator */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-plum/10 text-brand-plum px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-kesari" />
            <span>Profile Setup • Step {step} of 6</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            {step === 1 && "Basic Information (प्राथमिक माहिती)"}
            {step === 2 && "Location & Native Place (पत्ता व मूळ गाव)"}
            {step === 3 && "Education & Career (शिक्षण व नोकरी)"}
            {step === 4 && "Family Background (कौटुंबिक माहिती)"}
            {step === 5 && "Lifestyle & Bio (जीवनशैली व परिच्छेद)"}
            {step === 6 && "Partner Preferences (अपेक्षित जोडीदार)"}
          </h2>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-plum to-brand-kesari h-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Forms */}
        <div className="space-y-4 pt-2">
          
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Height</label>
                <select
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="5' 2&quot; (157 cm)">5' 2" (157 cm)</option>
                  <option value="5' 4&quot; (163 cm)">5' 4" (163 cm)</option>
                  <option value="5' 6&quot; (168 cm)">5' 6" (168 cm)</option>
                  <option value="5' 8&quot; (172 cm)">5' 8" (172 cm)</option>
                  <option value="5' 10&quot; (178 cm)">5' 10" (178 cm)</option>
                  <option value="6' 0&quot; (183 cm)">6' 0" (183 cm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Caste / Community</label>
                <select
                  value={formData.caste}
                  onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  {MAHARASHTRA_COMMUNITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">District (जिल्हा)</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  {MAHARASHTRA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">City / Area</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Native Place in Maharashtra (मूळ गाव)</label>
                <input
                  type="text"
                  value={formData.nativePlace}
                  onChange={(e) => setFormData({ ...formData, nativePlace: e.target.value })}
                  placeholder="e.g. Tasgaon, Sangli / Wai, Satara / Ichalkaranji"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Highest Education</label>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  {EDUCATION_LEVELS.map(ed => (
                    <option key={ed} value={ed}>{ed}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Occupation</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  {OCCUPATIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Annual Income Range</label>
                <select
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  {INCOME_RANGES.map(inc => (
                    <option key={inc} value={inc}>{inc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Father's Occupation</label>
                <input
                  type="text"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Mother's Occupation</label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Diet Preference</label>
                <select
                  value={formData.diet}
                  onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Strict Jain Vegetarian">Strict Jain Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">About Me (Bio)</label>
                <textarea
                  rows={4}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Preferred Age Range</label>
                <input
                  type="text"
                  value={formData.prefAge}
                  onChange={(e) => setFormData({ ...formData, prefAge: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Preferred Districts</label>
                <input
                  type="text"
                  value={formData.prefDistrict}
                  onChange={(e) => setFormData({ ...formData, prefDistrict: e.target.value })}
                  placeholder="e.g. Pune, Kolhapur, Sangli"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              {/* Biodata PDF Upload during Registration */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <h4 className="font-serif text-sm font-bold text-brand-plum">
                  Upload Maharashtrian Biodata PDF (बायोडेटा PDF अपलोड) - Optional
                </h4>
                <p className="text-xs text-brand-gray">
                  Upload your detailed family biodata PDF now or complete it later from your profile.
                </p>
                <BiodataPdfSection user={user} updateProfile={updateProfile} isEditable={true} />
              </div>
            </div>
          )}

        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-brand-charcoal flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-brand-plum text-white font-bold text-xs shadow-md hover:bg-brand-plumDark transition-all flex items-center space-x-2"
          >
            <span>{step === 6 ? "Finish Setup & Launch Dashboard" : "Save & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
