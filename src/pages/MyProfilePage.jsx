import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS } from '../data/maharashtraData';
import { BiodataPdfSection } from '../components/profile/BiodataPdfSection';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Edit3, 
  Camera, 
  Trash2, 
  Plus, 
  CheckCircle2,
  X,
  LayoutDashboard,
  LogOut,
  Upload,
  Image as ImageIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Save,
  FileText
} from 'lucide-react';

export const MyProfilePage = ({ onNavigate }) => {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useLanguage();

  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const initReligion = RELIGIONS.includes(user?.religion) ? (user?.religion || 'Hindu') : 'Other';
  const initCustomReligion = RELIGIONS.includes(user?.religion) ? '' : (user?.religion || '');

  const initCaste = MAHARASHTRA_COMMUNITIES.includes(user?.caste) ? (user?.caste || 'Brahmin (Deshastha / Kokanastha)') : 'Other';
  const initCustomCaste = MAHARASHTRA_COMMUNITIES.includes(user?.caste) ? '' : (user?.caste || '');

  const initEdu = EDUCATION_LEVELS.includes(user?.education) ? (user?.education || 'B.E. / B.Tech') : 'Other';
  const initCustomEdu = EDUCATION_LEVELS.includes(user?.education) ? '' : (user?.education || '');

  const initOcc = OCCUPATIONS.includes(user?.occupation) ? (user?.occupation || 'Software Engineer / IT Professional') : 'Other';
  const initCustomOcc = OCCUPATIONS.includes(user?.occupation) ? '' : (user?.occupation || '');

  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    gender: user?.gender || 'female',
    age: user?.age || '24',
    religion: initReligion,
    customReligion: initCustomReligion,
    district: user?.district || 'Pune',
    nativePlace: user?.nativePlace || 'Ichalkaranji / Sangli',
    caste: initCaste,
    customCaste: initCustomCaste,
    education: initEdu,
    customEducation: initCustomEdu,
    occupation: initOcc,
    customOccupation: initCustomOcc,
    aboutMe: user?.aboutMe || 'I am a family-oriented Maharashtrian professional based in Pune.'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const avatarFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const photos = user?.photos || [];
  const currentAvatar = user?.avatar || null;

  // Avatar Handlers
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    const newAvatarUrl = URL.createObjectURL(file);
    updateProfile({ avatar: newAvatarUrl });
    setShowAvatarMenu(false);
  };

  const handleRemoveAvatar = () => {
    updateProfile({ avatar: null });
    setShowAvatarMenu(false);
  };

  // Gallery Photo Handlers
  const handleGalleryFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    const uploadedUrl = URL.createObjectURL(file);
    const updated = [...photos, uploadedUrl];
    updateProfile({ photos: updated });
    setActivePhotoIdx(updated.length - 1);
  };

  const handleDeletePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    updateProfile({ photos: updated });
    if (activePhotoIdx >= updated.length) {
      setActivePhotoIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleOpenEditModal = () => {
    const rSel = RELIGIONS.includes(user?.religion) ? (user?.religion || 'Hindu') : 'Other';
    const rCust = RELIGIONS.includes(user?.religion) ? '' : (user?.religion || '');

    const cSel = MAHARASHTRA_COMMUNITIES.includes(user?.caste) ? (user?.caste || 'Brahmin (Deshastha / Kokanastha)') : 'Other';
    const cCust = MAHARASHTRA_COMMUNITIES.includes(user?.caste) ? '' : (user?.caste || '');

    const eSel = EDUCATION_LEVELS.includes(user?.education) ? (user?.education || 'B.E. / B.Tech') : 'Other';
    const eCust = EDUCATION_LEVELS.includes(user?.education) ? '' : (user?.education || '');

    const oSel = OCCUPATIONS.includes(user?.occupation) ? (user?.occupation || 'Software Engineer / IT Professional') : 'Other';
    const oCust = OCCUPATIONS.includes(user?.occupation) ? '' : (user?.occupation || '');

    setEditFormData({
      name: user?.name || '',
      gender: user?.gender || 'female',
      age: user?.age || '24',
      religion: rSel,
      customReligion: rCust,
      district: user?.district || 'Pune',
      nativePlace: user?.nativePlace || 'Ichalkaranji / Sangli',
      caste: cSel,
      customCaste: cCust,
      education: eSel,
      customEducation: eCust,
      occupation: oSel,
      customOccupation: oCust,
      aboutMe: user?.aboutMe || 'I am a family-oriented Maharashtrian professional based in Pune.'
    });
    setShowEditModal(true);
  };

  const handleSaveEditProfile = (e) => {
    e.preventDefault();
    const finalData = {
      ...editFormData,
      religion: editFormData.religion === 'Other' ? (editFormData.customReligion || 'Other') : editFormData.religion,
      caste: editFormData.caste === 'Other' ? (editFormData.customCaste || 'Other') : editFormData.caste,
      education: editFormData.education === 'Other' ? (editFormData.customEducation || 'Other') : editFormData.education,
      occupation: editFormData.occupation === 'Other' ? (editFormData.customOccupation || 'Other') : editFormData.occupation
    };
    delete finalData.customReligion;
    delete finalData.customCaste;
    delete finalData.customEducation;
    delete finalData.customOccupation;

    updateProfile(finalData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowEditModal(false);
    }, 1000);
  };

  const currentPhoto = photos[activePhotoIdx] || photos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury">
        <div className="flex items-center space-x-4">
          
          {/* Avatar with Independent Upload & Remove Options */}
          <div className="relative">
            <div 
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="relative cursor-pointer group"
              title="Click to upload or remove profile picture"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={user?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-brand-gold shadow-md shrink-0 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-plum text-brand-gold flex items-center justify-center border-2 border-brand-gold shadow-md shrink-0 font-serif font-bold text-2xl transition-transform group-hover:scale-105">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8 text-brand-gold" />}
                </div>
              )}

              {/* Camera Badge Icon */}
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 bg-brand-plum text-brand-gold border-2 border-white rounded-full shadow-md hover:bg-brand-plumDark transition-all"
                title="Edit profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Picture Actions Dropdown */}
            {showAvatarMenu && (
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-brand-rose/30 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-plum uppercase tracking-wider">Profile Photo</span>
                  <button 
                    onClick={() => setShowAvatarMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option 1: Upload Photo */}
                <button
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum flex items-center space-x-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-brand-plum shrink-0" />
                  <span>Upload Profile Picture</span>
                </button>

                {/* Option 2: Remove Photo */}
                {currentAvatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center space-x-2 transition-colors border-t border-gray-50"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Remove Profile Picture</span>
                  </button>
                )}
              </div>
            )}

            <input
              type="file"
              ref={avatarFileInputRef}
              onChange={handleAvatarFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-plum">{user?.name}</h1>
              <VerificationBadge size="small" />
            </div>
            <p className="text-xs text-brand-gray mt-0.5">
              {user?.district || 'Pune'}, Maharashtra • {user?.religion || 'Hindu'} ({user?.caste || 'Brahmin'})
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-3.5 py-2.5 bg-brand-plum/10 text-brand-plum border border-brand-plum/20 font-bold text-xs rounded-xl hover:bg-brand-plum/20 transition-all flex items-center justify-center space-x-1.5"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-plum shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* Edit Profile Modal Trigger */}
          <button
            onClick={handleOpenEditModal}
            className="px-3.5 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5"
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>{t('editProfile')}</span>
          </button>

          <button
            onClick={() => setShowPhotoManager(true)}
            className="px-3.5 py-2.5 bg-amber-50 text-brand-kesari border border-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all flex items-center justify-center space-x-1.5"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Photos ({photos.length})</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="px-3.5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. ABOUT ME SECTION (BELOW HEADER) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-serif font-bold text-xl text-brand-plum flex items-center space-x-2">
            <span>{t('aboutMe')}</span>
          </h3>
          <button
            onClick={handleOpenEditModal}
            className="text-xs text-brand-kesari font-semibold hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Bio</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-brand-gray leading-relaxed bg-brand-ivory p-4 rounded-2xl border border-brand-rose/10">
          {user?.aboutMe || "I am a family-oriented Maharashtrian professional based in Pune. I balance modern aspirations with traditional family values."}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="bg-brand-lightBg p-3.5 rounded-2xl border border-brand-rose/10">
            <span className="text-[10px] text-brand-gray uppercase font-semibold">Native Place (मूळ गाव)</span>
            <p className="font-bold text-brand-plum mt-1">{user?.nativePlace || 'Ichalkaranji / Sangli'}</p>
          </div>

          <div className="bg-brand-lightBg p-3.5 rounded-2xl border border-brand-rose/10">
            <span className="text-[10px] text-brand-gray uppercase font-semibold">Education (शिक्षण)</span>
            <p className="font-bold text-brand-plum mt-1 truncate">{user?.education || 'B.E. / B.Tech'}</p>
          </div>

          <div className="bg-brand-lightBg p-3.5 rounded-2xl border border-brand-rose/10">
            <span className="text-[10px] text-brand-gray uppercase font-semibold">Occupation (नोकरी / व्यवसाय)</span>
            <p className="font-bold text-brand-plum mt-1 truncate">{user?.occupation || 'Software Engineer'}</p>
          </div>
        </div>
      </div>

      {/* 3. INDEPENDENT IMAGE GALLERY SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
        
        {/* Header & Upload Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-rose/10 pb-4">
          <div>
            <h3 className="font-serif font-bold text-xl text-brand-plum flex items-center space-x-2">
              <Camera className="w-5 h-5 text-brand-kesari" />
              <span>My Image Gallery (फोटो गॅलरी - {photos.length})</span>
            </h3>
            <p className="text-xs text-brand-gray mt-0.5">
              Add or remove photos of yourself to share with prospective matches.
            </p>
          </div>

          {/* Add Photo Button */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => galleryFileInputRef.current?.click()}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5"
            >
              <Upload className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Upload Photo</span>
            </button>
            <input
              type="file"
              ref={galleryFileInputRef}
              onChange={handleGalleryFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Gallery Content - Clean Responsive Photo Grid */}
        {photos.length === 0 ? (
          /* Empty Gallery Dropzone */
          <div className="w-full py-12 rounded-2xl border-2 border-dashed border-brand-rose/30 bg-brand-ivory/50 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center">
              <Camera className="w-8 h-8 text-brand-plum" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-serif font-bold text-base text-brand-plum">No Gallery Photos Yet</h4>
              <p className="text-xs text-brand-gray">
                Upload photos of yourself to make your profile stand out and receive 3x more interest requests.
              </p>
            </div>
            <button
              onClick={() => galleryFileInputRef.current?.click()}
              className="px-5 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-brand-gold" />
              <span>Add Your First Photo</span>
            </button>
          </div>
        ) : (
          /* Normal Responsive Photo Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((img, idx) => (
              <div
                key={idx}
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-brand-rose/20 bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {/* Photo Image */}
                <img
                  src={img}
                  alt={`Gallery photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Lightbox Expand Button (Top Right) */}
                <button
                  onClick={() => {
                    setActivePhotoIdx(idx);
                    setLightboxOpen(true);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-brand-plum transition-all shadow-md z-10"
                  title="Expand Photo"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Action Overlay Controls (On Hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 z-10">
                  <button
                    onClick={() => handleDeletePhoto(idx)}
                    className="px-3.5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow hover:bg-rose-700 transition-all flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Photo Card in Grid */}
            <div
              onClick={() => galleryFileInputRef.current?.click()}
              className="h-64 sm:h-72 rounded-2xl border-2 border-dashed border-brand-rose/40 hover:border-brand-plum bg-brand-ivory/60 hover:bg-brand-ivory cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-brand-plum">Upload New Photo</span>
              <span className="text-xs text-brand-gray mt-1">Add another photo of yourself</span>
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
              className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden">
            <img
              src={currentPhoto}
              alt="Full size view"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>

          {photos.length > 1 && (
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* EDIT PROFILE INLINE MODAL WITH ALL REGISTRATION FIELDS (EXCLUDING EMAIL, PHONE, PASSWORD) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-brand-plum"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-xl text-brand-plum">{t('editProfile')}</h3>
              {savedSuccess && (
                <span className="flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveEditProfile} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Full Name */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Full Name (संपूर्ण नाव)</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  />
                </div>

                {/* 2. Looking for Match for */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Looking for Match for</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  >
                    <option value="female">Bride (वधू) - Female</option>
                    <option value="male">Groom (वर) - Male</option>
                  </select>
                </div>

                {/* 3. Age */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Age (वय)</label>
                  <input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  />
                </div>

                {/* 4. Religion */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Religion (धर्म)</label>
                  <select
                    value={editFormData.religion}
                    onChange={(e) => setEditFormData({ ...editFormData, religion: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  >
                    {RELIGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>

                  {editFormData.religion === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Specify Religion (धर्म सांगा)"
                      value={editFormData.customReligion}
                      onChange={(e) => setEditFormData({ ...editFormData, customReligion: e.target.value })}
                      className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                    />
                  )}
                </div>

                {/* 5. Maharashtra District */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Maharashtra District (जिल्हा)</label>
                  <select
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  >
                    {MAHARASHTRA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Native Place */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Native Place (मूळ गाव)</label>
                  <input
                    type="text"
                    value={editFormData.nativePlace}
                    onChange={(e) => setEditFormData({ ...editFormData, nativePlace: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  />
                </div>

                {/* 7. Community / Caste */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Community / Caste (जात)</label>
                  <select
                    value={editFormData.caste}
                    onChange={(e) => setEditFormData({ ...editFormData, caste: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  >
                    {MAHARASHTRA_COMMUNITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {editFormData.caste === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Specify Caste / Community (जात सांगा)"
                      value={editFormData.customCaste}
                      onChange={(e) => setEditFormData({ ...editFormData, customCaste: e.target.value })}
                      className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                    />
                  )}
                </div>

                {/* 8. Education */}
                <div>
                  <label className="block font-semibold mb-1 text-brand-charcoal">Education (शिक्षण)</label>
                  <select
                    value={editFormData.education}
                    onChange={(e) => setEditFormData({ ...editFormData, education: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  >
                    {EDUCATION_LEVELS.map(ed => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>

                  {editFormData.education === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Specify Highest Education (शिक्षण सांगा)"
                      value={editFormData.customEducation}
                      onChange={(e) => setEditFormData({ ...editFormData, customEducation: e.target.value })}
                      className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                    />
                  )}
                </div>

                {/* 9. Occupation */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-brand-charcoal">Occupation (नोकरी / व्यवसाय)</label>
                  <select
                    value={editFormData.occupation}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                  >
                    {OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>

                  {editFormData.occupation === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Specify Occupation (नोकरी / व्यवसाय सांगा)"
                      value={editFormData.customOccupation}
                      onChange={(e) => setEditFormData({ ...editFormData, customOccupation: e.target.value })}
                      className="w-full mt-2 p-2.5 rounded-xl border border-brand-plum/40 bg-brand-ivory text-xs focus:ring-2 focus:ring-brand-plum/20"
                    />
                  )}
                </div>
              </div>

              {/* 10. About Me (Bio) */}
              <div>
                <label className="block font-semibold mb-1 text-brand-charcoal">About Me (Bio / परिच्छेद)</label>
                <textarea
                  rows={3}
                  value={editFormData.aboutMe}
                  onChange={(e) => setEditFormData({ ...editFormData, aboutMe: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20"
                />
              </div>

              {/* 11. Maharashtrian Biodata PDF Upload Section */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <label className="block font-bold text-brand-plum flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-brand-kesari" />
                  <span>Biodata PDF (बायोडेटा PDF)</span>
                </label>
                <BiodataPdfSection user={user} updateProfile={updateProfile} isEditable={true} />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30 mt-4"
              >
                <Save className="w-4 h-4 text-brand-gold" />
                <span>Save Profile Changes</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Interactive Photo Manager Modal */}
      {showPhotoManager && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setShowPhotoManager(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-brand-plum"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-brand-plum">{t('photoManagerTitle')}</h3>
              <p className="text-xs text-brand-gray">{t('maxPhotosNotice')}</p>
            </div>

            {/* Current Photos Grid */}
            <div className="grid grid-cols-3 gap-3">
              {photos.map((img, idx) => (
                <div key={idx} className="relative group h-32 rounded-2xl overflow-hidden border-2 border-gray-200">
                  <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button
                      onClick={() => handleDeletePhoto(idx)}
                      className="p-2 bg-rose-600 text-white rounded-full hover:scale-110 flex items-center space-x-1"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Photo Button */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-4 h-4 text-brand-gold" />
                <span>Upload New Photo</span>
              </button>
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={handleGalleryFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <button
              onClick={() => setShowPhotoManager(false)}
              className="w-full py-2.5 bg-gray-100 text-brand-charcoal font-bold text-xs rounded-xl hover:bg-gray-200"
            >
              Done
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
