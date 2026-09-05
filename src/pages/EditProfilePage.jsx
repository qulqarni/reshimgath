import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES } from '../data/maharashtraData';
import { uploadBiodataPdfToFirebase } from '../services/firebaseService';
import { 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  UploadCloud, 
  Eye, 
  EyeOff,
  Lock,
  Trash2, 
  Download, 
  X
} from 'lucide-react';

export const EditProfilePage = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    gender: user?.gender || 'female',
    district: user?.district || '',
    city: user?.city || '',
    nativePlace: user?.nativePlace || '',
    education: user?.education || '',
    occupation: user?.occupation || '',
    company: user?.company || '',
    income: user?.income || '',
    caste: user?.caste || '',
    aboutMe: user?.aboutMe || '',
    fatherOccupation: user?.fatherOccupation || '',
    motherOccupation: user?.motherOccupation || ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passError, setPassError] = useState('');

  const [saved, setSaved] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const fileInputRef = useRef(null);

  const biodata = user?.biodataPdf;

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      alert('Please select a valid PDF document or Image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      const newBiodata = {
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileType: isImage ? 'image' : 'pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        url: base64Url
      };

      updateProfile({ biodataPdf: newBiodata });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPassError('');

    if (newPassword) {
      if (newPassword.length < 6) {
        setPassError('Password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPassError('Passwords do not match.');
        return;
      }
    }

    const payload = {
      ...formData,
      ...(newPassword ? { password: newPassword } : {})
    };

    updateProfile(payload);
    if (newPassword) {
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <button
        onClick={() => onNavigate('/my-profile')}
        className="flex items-center space-x-1.5 text-xs font-bold text-brand-plum hover:text-brand-kesari"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Profile</span>
      </button>

      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-2xl p-6 sm:p-10 space-y-6">
        
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="font-serif text-2xl font-bold text-brand-plum">{t('editProfile')}</h1>
          {saved && (
            <span className="flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully!</span>
            </span>
          )}
        </div>

        {passError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
            {passError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Full Name (संपूर्ण नाव)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Gender (लिंग)</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              >
                <option value="female">Female (स्त्री)</option>
                <option value="male">Male (पुरुष)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Maharashtra District</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              >
                <option value="">Select District</option>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Native Place (मूळ गाव)</label>
              <input
                type="text"
                value={formData.nativePlace}
                onChange={(e) => setFormData({ ...formData, nativePlace: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Caste / Community</label>
              <select
                value={formData.caste}
                onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              >
                <option value="">Select Caste / Community</option>
                {MAHARASHTRA_COMMUNITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Education</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-plum flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-brand-kesari" />
              <span>Change Password (पासवर्ड बदला) - Optional</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-brand-charcoal">New Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-brand-plum"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-brand-charcoal">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-brand-plum"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">About Me (Bio)</label>
            <textarea
              rows={3}
              value={formData.aboutMe}
              onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 text-xs"
            />
          </div>

          {/* COMPACT STANDARD FORM FIELD FOR BIODATA */}
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Biodata (PDF / फोटो)
            </label>
            
            <div className="flex items-center gap-3 bg-brand-ivory/60 p-3 rounded-xl border border-gray-200">
              <FileText className="w-5 h-5 text-brand-plum shrink-0" />
              
              <div className="flex-1 min-w-0">
                {biodata ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-plum truncate">{biodata.fileName}</p>
                      <p className="text-[10px] text-brand-gray">{biodata.fileSize} • Uploaded {biodata.uploadedAt}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowViewerModal(true)}
                        className="px-2.5 py-1 bg-brand-plum text-white text-[11px] font-bold rounded-lg hover:bg-brand-plumDark transition-all flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3 text-brand-gold" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-amber-50 text-brand-kesari border border-amber-300 text-[11px] font-bold rounded-lg hover:bg-amber-100 transition-all flex items-center space-x-1"
                      >
                        <UploadCloud className="w-3 h-3 text-brand-kesari" />
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateProfile({ biodataPdf: null })}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                        title="Remove Biodata"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-brand-gray truncate">No Biodata uploaded yet (PDF / Image up to 10MB)</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-brand-plum text-white text-xs font-bold rounded-xl shadow hover:bg-brand-plumDark transition-all shrink-0 flex items-center space-x-1"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Upload Biodata</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePdfUpload}
              accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-2 mt-4"
          >
            <Save className="w-4 h-4 text-brand-gold" />
            <span>Save Profile Updates</span>
          </button>
        </form>

      </div>

      {/* MAHARASHTRIAN BIODATA PDF VIEWER MODAL */}
      {showViewerModal && biodata && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowViewerModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-brand-plum"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Traditional Header */}
            <div className="text-center border-b border-brand-rose/20 pb-4 space-y-1">
              <p className="text-brand-plum font-serif font-bold text-sm tracking-widest">॥ श्री गणेशाय नमः ॥</p>
              <h3 className="font-serif text-2xl font-bold text-brand-plum">
                {user?.name} - Sambodhi Sarang Biodata
              </h3>
              <p className="text-xs text-brand-gray">
                Verified Maharashtrian Family Background & Profile Summary
              </p>
            </div>

            {/* Content summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-brand-lightBg p-3 rounded-xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Full Name</span>
                <p className="font-bold text-brand-plum mt-0.5">{user?.name}</p>
              </div>
              <div className="bg-brand-lightBg p-3 rounded-xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Native Place</span>
                <p className="font-bold text-brand-plum mt-0.5">{user?.nativePlace || 'Satara'}</p>
              </div>
              <div className="bg-brand-lightBg p-3 rounded-xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Education</span>
                <p className="font-bold text-brand-plum mt-0.5">{user?.education || 'Graduate'}</p>
              </div>
              <div className="bg-brand-lightBg p-3 rounded-xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Occupation</span>
                <p className="font-bold text-brand-plum mt-0.5">{user?.occupation || 'Professional'}</p>
              </div>
              <div className="bg-brand-lightBg p-3 rounded-xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Caste</span>
                <p className="font-bold text-brand-plum mt-0.5">{user?.caste || 'Maratha'}</p>
              </div>
              <div className="bg-brand-lightBg p-3 rounded-xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">District</span>
                <p className="font-bold text-brand-plum mt-0.5">{user?.district || 'Pune'}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <a
                href={biodata.url || '#'}
                download={biodata.fileName || 'Biodata.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4 text-brand-gold" />
                <span>Download PDF File</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
