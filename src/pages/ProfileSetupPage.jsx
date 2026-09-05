import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS, INCOME_RANGES, HEIGHT_OPTIONS } from '../data/maharashtraData';
import { BiodataPdfSection } from '../components/profile/BiodataPdfSection';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ProfileSetupPage = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);

  const initReligion = user?.religion ? (RELIGIONS.includes(user.religion) ? user.religion : 'Other') : '';
  const initCustomReligion = user?.religion && !RELIGIONS.includes(user.religion) ? user.religion : '';

  const initCaste = user?.caste ? (MAHARASHTRA_COMMUNITIES.includes(user.caste) ? user.caste : 'Other') : '';
  const initCustomCaste = user?.caste && !MAHARASHTRA_COMMUNITIES.includes(user.caste) ? user.caste : '';

  const initEdu = user?.education ? (EDUCATION_LEVELS.includes(user.education) ? user.education : 'Other') : '';
  const initCustomEdu = user?.education && !EDUCATION_LEVELS.includes(user.education) ? user.education : '';

  const initOcc = user?.occupation ? (OCCUPATIONS.includes(user.occupation) ? user.occupation : 'Other') : '';
  const initCustomOcc = user?.occupation && !OCCUPATIONS.includes(user.occupation) ? user.occupation : '';

  const [formData, setFormData] = useState({
    dob: user?.dob || '',
    height: user?.height || '',
    maritalStatus: user?.maritalStatus || '',
    religion: initReligion,
    customReligion: initCustomReligion,
    caste: initCaste,
    customCaste: initCustomCaste,
    motherTongue: user?.motherTongue || '',
    bloodGroup: user?.bloodGroup || '',
    state: user?.state || 'Maharashtra',
    district: user?.district || '',
    city: user?.city || '',
    nativePlace: user?.nativePlace || '',
    education: initEdu,
    customEducation: initCustomEdu,
    college: user?.college || '',
    occupation: initOcc,
    customOccupation: initCustomOcc,
    company: user?.company || '',
    income: user?.income || '',
    fatherOccupation: user?.fatherOccupation || '',
    motherOccupation: user?.motherOccupation || '',
    siblings: user?.siblings || '',
    familyType: user?.familyType || '',
    diet: user?.diet || '',
    smoking: user?.smoking || '',
    drinking: user?.drinking || '',
    hobbies: user?.hobbies || '',
    aboutMe: user?.aboutMe || ''
  });

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      const finalData = {
        ...formData,
        religion: formData.religion === 'Other' ? (formData.customReligion || 'Other') : formData.religion,
        caste: formData.caste === 'Other' ? (formData.customCaste || 'Other') : formData.caste,
        education: formData.education === 'Other' ? (formData.customEducation || 'Other') : formData.education,
        occupation: formData.occupation === 'Other' ? (formData.customOccupation || 'Other') : formData.occupation
      };
      delete finalData.customReligion;
      delete finalData.customCaste;
      delete finalData.customEducation;
      delete finalData.customOccupation;

      updateProfile(finalData);
      onNavigate('/my-profile');
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
            {step === 6 && "Biodata PDF (बायोडेटा PDF)"}
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
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Religion (धर्म)</label>
                <select
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">Select Religion (धर्म निवडा)</option>
                  {RELIGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {formData.religion === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Specify Religion (धर्म सांगा)"
                    value={formData.customReligion}
                    onChange={(e) => setFormData({ ...formData, customReligion: e.target.value })}
                    className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Community / Caste (जात)</label>
                <select
                  value={formData.caste}
                  onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">Select Caste / Community (जात निवडा)</option>
                  {MAHARASHTRA_COMMUNITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {formData.caste === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Specify Caste / Community (जात सांगा)"
                    value={formData.customCaste}
                    onChange={(e) => setFormData({ ...formData, customCaste: e.target.value })}
                    className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                  />
                )}
              </div>

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
                  <option value="">Select Height (उंची निवडा)</option>
                  {HEIGHT_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Mother Tongue</label>
                <input
                  type="text"
                  value={formData.motherTongue}
                  onChange={(e) => setFormData({ ...formData, motherTongue: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
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
                  <option value="">Select District (जिल्हा निवडा)</option>
                  {MAHARASHTRA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Current City / Area</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Native Place (मूळ गाव)</label>
                <input
                  type="text"
                  value={formData.nativePlace}
                  onChange={(e) => setFormData({ ...formData, nativePlace: e.target.value })}
                  placeholder="e.g. Satara / Sangli / Ichalkaranji"
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
                  <option value="">Select Education (शिक्षण निवडा)</option>
                  {EDUCATION_LEVELS.map(ed => (
                    <option key={ed} value={ed}>{ed}</option>
                  ))}
                </select>

                {formData.education === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Specify Highest Education (शिक्षण सांगा)"
                    value={formData.customEducation}
                    onChange={(e) => setFormData({ ...formData, customEducation: e.target.value })}
                    className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">College / University</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Occupation</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">Select Occupation (नोकरी निवडा)</option>
                  {OCCUPATIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>

                {formData.occupation === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Specify Occupation (नोकरी / व्यवसाय सांगा)"
                    value={formData.customOccupation}
                    onChange={(e) => setFormData({ ...formData, customOccupation: e.target.value })}
                    className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Annual Income Range</label>
                <select
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">Select Income Range</option>
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

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Siblings</label>
                <input
                  type="text"
                  value={formData.siblings}
                  onChange={(e) => setFormData({ ...formData, siblings: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Family Type</label>
                <select
                  value={formData.familyType}
                  onChange={(e) => setFormData({ ...formData, familyType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">Select Family Type</option>
                  <option value="Nuclear Family">Nuclear Family</option>
                  <option value="Joint Family">Joint Family</option>
                </select>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">Diet Preference</label>
                  <select
                    value={formData.diet}
                    onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <option value="">Select Diet</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">Smoking</label>
                  <select
                    value={formData.smoking}
                    onChange={(e) => setFormData({ ...formData, smoking: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <option value="">Select Smoking</option>
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">Drinking</label>
                  <select
                    value={formData.drinking}
                    onChange={(e) => setFormData({ ...formData, drinking: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <option value="">Select Drinking</option>
                    <option value="No">No</option>
                    <option value="Socially">Socially</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">About Me (परिच्छेद)</label>
                <textarea
                  rows={4}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Write a few lines about yourself, your family values, and what you are looking for in a life partner..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              {/* Biodata PDF Upload during Registration */}
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-bold text-brand-plum uppercase tracking-wider">
                  Upload Biodata PDF (बायोडेटा PDF अपलोड) - Optional
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
            <span>{step === 6 ? "Finish Setup & View My Profile" : "Save & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
