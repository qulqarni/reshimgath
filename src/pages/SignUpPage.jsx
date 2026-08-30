import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES } from '../data/maharashtraData';
import { Heart, User, Mail, Lock, Phone, MapPin, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export const SignUpPage = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'female',
    age: '24',
    district: 'Pune',
    caste: 'Maratha'
  });

  const [biodataPdf, setBiodataPdf] = useState(null);

  const handleBiodataFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setBiodataPdf({
      fileName: file.name,
      fileSize: fileSizeFormatted,
      uploadedAt: new Date().toISOString().split('T')[0],
      url: URL.createObjectURL(file)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup({ ...formData, biodataPdf });
    onNavigate('/profile-setup');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-brand-rose/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-plum text-brand-gold flex items-center justify-center mx-auto shadow-md border border-brand-gold/40">
            <Heart className="w-6 h-6 fill-brand-kesari text-brand-gold" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            {t('signupHeading')}
          </h2>
          <p className="text-xs text-brand-gray">
            {t('signupSubheading')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Full Name (संपूर्ण नाव) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Swara Deshmukh"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Looking for Match for *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
              >
                <option value="female">Bride (वधू) - Female</option>
                <option value="male">Groom (वर) - Male</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98220 00000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Maharashtra District (जिल्हा) *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
              >
                {MAHARASHTRA_DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* Caste */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Community / Caste (जात) *
              </label>
              <select
                value={formData.caste}
                onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
              >
                {MAHARASHTRA_COMMUNITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Create Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
              />
            </div>
          </div>

          {/* Optional Biodata PDF Upload Field */}
          <div className="bg-brand-ivory/80 p-3.5 rounded-2xl border border-brand-rose/20 space-y-1.5">
            <label className="block text-xs font-bold text-brand-plum flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-brand-kesari" />
              <span>Maharashtrian Biodata PDF (Optional / बायोडेटा PDF)</span>
            </label>
            <p className="text-[11px] text-brand-gray">Upload your family biodata PDF file now (up to 10MB)</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleBiodataFileChange}
              className="w-full text-xs text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-plum file:text-white hover:file:bg-brand-plumDark cursor-pointer"
            />
            {biodataPdf && (
              <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected: {biodataPdf.fileName}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all border border-brand-gold/30 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Create Profile & Proceed to Setup</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-brand-gray">
            Already registered on ReshimGath?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="font-bold text-brand-plum hover:underline"
            >
              {t('login')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
