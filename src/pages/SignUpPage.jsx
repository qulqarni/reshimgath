import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Lock, Phone, Sparkles, Eye, EyeOff, Calendar, Loader2, Camera, UploadCloud, CheckCircle2 } from 'lucide-react';
import { calculateAgeFromDob } from '../utils/ageCalculator';
import { uploadPhotoToFirebase } from '../services/firebaseService';
import { compressImageToFile } from '../utils/imageCompressor';

export const SignUpPage = ({ onNavigate }) => {
  const { signup, checkExistingUser, checkExistingUserAsync } = useAuth();
  const { t } = useLanguage();

  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    age: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [asyncCheck, setAsyncCheck] = useState({ emailExists: false, phoneExists: false });

  // 1. Instant synchronous check against local memory & stored profiles
  const localCheck = React.useMemo(() => {
    if (!checkExistingUser) return { emailExists: false, phoneExists: false };
    return checkExistingUser(formData.email, formData.phone);
  }, [formData.email, formData.phone, checkExistingUser]);

  // 2. Debounced asynchronous check against Firestore database
  useEffect(() => {
    let isCancelled = false;
    const cleanPhone = (formData.phone || '').trim();
    const cleanEmail = (formData.email || '').trim();

    if (!cleanPhone && !cleanEmail) {
      setAsyncCheck({ emailExists: false, phoneExists: false });
      return;
    }

    const timer = setTimeout(async () => {
      if (checkExistingUserAsync) {
        try {
          const res = await checkExistingUserAsync(cleanEmail, cleanPhone);
          if (!isCancelled && res) {
            setAsyncCheck(res);
          }
        } catch (e) {}
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.phone, formData.email, checkExistingUserAsync]);

  // Clean up photo preview object URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    setError('');
    setIsCompressingPhoto(true);

    try {
      const compressed = await compressImageToFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85
      });
      setPhotoFile(compressed);
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch (err) {
      console.warn('Compression fallback to original file:', err);
      setPhotoFile(file);
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(URL.createObjectURL(file));
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setPhotoFile(null);
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const existingCheck = {
    emailExists: localCheck.emailExists || asyncCheck.emailExists,
    phoneExists: localCheck.phoneExists || asyncCheck.phoneExists
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSubmitting) return;

    if (!agreeToTerms) {
      setError('You must accept the Terms of Use and Community Safety Rules to register.');
      return;
    }

    // Compulsory profile photo check
    if (!photoFile) {
      setError('Profile photo is compulsory (अनिवार्य). Please upload a clear photograph of the candidate to register.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.gender) {
      setError('Please select your gender.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your mobile number.');
      return;
    }

    if (!formData.dob) {
      setError('Please select your date of birth.');
      return;
    }

    const calculatedAge = formData.age || calculateAgeFromDob(formData.dob);
    if (calculatedAge && Number(calculatedAge) < 18) {
      setError('Candidate must be at least 18 years of age to register.');
      return;
    }

    if (existingCheck.emailExists && existingCheck.phoneExists) {
      setError('This Email ID and Mobile Number are already registered. Please login to your existing account.');
      return;
    }

    if (existingCheck.emailExists) {
      setError('This Email ID is already registered. Please login or use a different email address.');
      return;
    }

    if (existingCheck.phoneExists) {
      setError('This Mobile Number is already registered. Each mobile number can only be used for one registration.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload compulsory profile photo to Firebase Storage
      let uploadedAvatarUrl = '';
      const tempId = `reg_${Date.now()}`;
      try {
        uploadedAvatarUrl = await uploadPhotoToFirebase(photoFile, tempId, 'avatars');
      } catch (uploadErr) {
        console.warn('Firebase Storage upload failed, converting to optimized data URL fallback:', uploadErr);
        // Fallback to data URL so registration is never blocked if storage encounters an issue
        uploadedAvatarUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(photoFile);
        });
      }

      if (!uploadedAvatarUrl) {
        setError('Failed to process profile photo. Please select another image and try again.');
        setIsSubmitting(false);
        return;
      }

      const res = await signup({
        ...formData,
        avatar: uploadedAvatarUrl,
        photos: [uploadedAvatarUrl]
      });
      if (res && res.success) {
        let redirectPath = null;
        try {
          redirectPath = sessionStorage.getItem('reshimgath_redirect_after_auth');
          if (redirectPath) {
            sessionStorage.removeItem('reshimgath_redirect_after_auth');
          }
        } catch (e) {}

        if (redirectPath) {
          onNavigate(redirectPath);
        } else {
          onNavigate('/profile-setup');
        }
      } else {
        setError(res?.message || 'Failed to create profile. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-brand-rose/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <img 
            src="/logo.png" 
            alt="Sambodhi Sarang Marriage Bureau" 
            className="h-16 w-auto object-contain mx-auto" 
          />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            {t('signupHeading')}
          </h2>
          <p className="text-xs text-brand-gray">
            {t('signupSubheading')}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-xs text-rose-700 font-bold space-y-2 shadow-sm animate-in fade-in">
            <div className="flex items-start space-x-2">
              <span className="text-base">⚠️</span>
              <p className="leading-snug flex-1">{error}</p>
            </div>
            {(error.includes('already registered') || error.includes('already exists')) && (
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                <span className="text-[11px] text-rose-800">Already registered on Sambodhi Sarang?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-1.5 bg-brand-plum hover:bg-brand-plumDark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Log In Now →
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Compulsory Profile Photo Upload Section */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-3 ${
            photoPreview
              ? 'bg-emerald-50/40 border-emerald-300'
              : 'bg-gradient-to-br from-brand-plum/5 via-brand-lightBg to-brand-rose/10 border-dashed border-brand-plum/40 hover:border-brand-plum'
          }`}>
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-brand-plum" />
              <label className="text-xs font-bold text-brand-plum uppercase tracking-wider">
                Profile Photo (प्रोफाइल फोटो) *
              </label>
              <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                Mandatory / अनिवार्य
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
              title="Click to choose or change profile photo"
            >
              <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 transition-all duration-300 flex items-center justify-center shadow-md ${
                photoPreview
                  ? 'border-emerald-500 ring-4 ring-emerald-200'
                  : 'border-dashed border-brand-plum/50 bg-white hover:border-brand-plum hover:scale-105'
              }`}>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Candidate Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    {isCompressingPhoto ? (
                      <Loader2 className="w-8 h-8 text-brand-plum animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-brand-plum/70 group-hover:text-brand-plum group-hover:scale-110 transition-all mb-1" />
                        <span className="text-[11px] font-bold text-brand-plum leading-tight">
                          Select Photo *
                        </span>
                        <span className="text-[9px] text-gray-500 font-semibold mt-0.5">
                          (फोटो निवडा)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Camera Icon Badge */}
              <button
                type="button"
                className="absolute bottom-1 right-1 p-2 bg-brand-plum hover:bg-brand-plumDark text-white rounded-full shadow-lg border-2 border-white transition-transform active:scale-90"
                title="Choose photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div className="space-y-1">
              <p className="text-[11px] text-brand-charcoal font-medium">
                {photoPreview ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Photo selected successfully! (फोटो निवडला गेला)
                  </span>
                ) : (
                  <span>Please upload a clear portrait photo of the candidate to register.</span>
                )}
              </p>
              <p className="text-[10px] text-gray-500">
                JPG, PNG, WebP • Max 10MB • Clear front-facing face
              </p>
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold transition-colors pt-0.5 block mx-auto"
                >
                  Remove & Choose Another Photo
                </button>
              )}
            </div>
          </div>

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
                Gender (लिंग) *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
              >
                <option value="">Select Gender (लिंग निवडा)</option>
                <option value="female">Female (स्त्री)</option>
                <option value="male">Male (पुरुष)</option>
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
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:ring-2 ${
                    existingCheck.emailExists
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-gray-200 focus:border-brand-plum focus:ring-brand-plum/20'
                  }`}
                />
              </div>
              {existingCheck.emailExists && (
                <div className="text-[11px] text-rose-600 font-bold mt-1 flex items-center justify-between bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  <span>⚠️ Email already registered!</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="text-brand-plum underline hover:text-brand-plumDark"
                  >
                    Log in
                  </button>
                </div>
              )}
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
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:ring-2 ${
                    existingCheck.phoneExists
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-gray-200 focus:border-brand-plum focus:ring-brand-plum/20'
                  }`}
                />
              </div>
              {existingCheck.phoneExists && (
                <div className="text-[11px] text-rose-600 font-bold mt-1 flex items-center justify-between bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  <span>⚠️ Mobile already registered! (Only 1 registration allowed per number)</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="text-brand-plum underline hover:text-brand-plumDark"
                  >
                    Log in
                  </button>
                </div>
              )}
            </div>

            {/* Date of Birth & Auto-Calculated Age */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-brand-charcoal">
                  Date of Birth (जन्मतारीख) *
                </label>
                {formData.age && (
                  <span className="text-[11px] font-bold text-brand-plum bg-brand-rose/20 px-2.5 py-0.5 rounded-full border border-brand-rose/40 animate-in fade-in">
                    Age: {formData.age} Years (वय: {formData.age} वर्षे)
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const val = e.target.value;
                    const calculated = calculateAgeFromDob(val);
                    setFormData({ ...formData, dob: val, age: calculated });
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
              </div>
            </div>

          </div>

          {/* Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Create Password */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-brand-plum"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-brand-plum"
                  title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Explicit Terms of Use and Safety Rules Agreement */}
          <div className="p-3.5 bg-brand-lightBg/60 rounded-2xl border border-brand-rose/20 text-xs text-brand-charcoal space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 rounded text-brand-plum focus:ring-brand-plum w-4 h-4 cursor-pointer shrink-0"
              />
              <span className="text-[11px] leading-relaxed text-gray-700">
                I have read, understood, and agree to the{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/terms-of-service')}
                  className="font-bold text-brand-plum underline hover:text-brand-plumDark inline"
                >
                  Terms of Use
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/child-safety')}
                  className="font-bold text-brand-plum underline hover:text-brand-plumDark inline"
                >
                  Community Safety Rules
                </button>
                . I confirm that I am at least 18 years of age and will not upload fake, obscene, scam, or underage content.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isCompressingPhoto || existingCheck.phoneExists || existingCheck.emailExists}
            className={`w-full py-3.5 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all border border-brand-gold/30 flex items-center justify-center space-x-2 ${
              isSubmitting || isCompressingPhoto || existingCheck.phoneExists || existingCheck.emailExists
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:brightness-105 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                <span>Uploading Photo & Creating Profile...</span>
              </>
            ) : isCompressingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                <span>Processing Photo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span>Create Profile & Proceed to Setup</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-brand-gray">
            Already registered on Sambodhi Sarang?{' '}
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
