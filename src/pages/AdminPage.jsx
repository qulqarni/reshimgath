import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS, INCOME_RANGES, HEIGHT_OPTIONS } from '../data/maharashtraData';
import { compressImage } from '../utils/imageCompressor';
import { uploadPhotoToFirebase, uploadStoryPhotoToFirebase, uploadBiodataPdfToFirebase } from '../services/firebaseService';
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Star, 
  Sparkles,
  Lock,
  ArrowRight,
  X,
  Save,
  MessageSquare,
  Layout,
  Heart,
  Plus,
  Camera,
  Upload,
  User,
  Ban,
  UserX,
  ShieldOff,
  Image as ImageIcon,
  Crown,
  CreditCard,
  Eye,
  Award,
  UploadCloud,
  Loader2
} from 'lucide-react';

export const getSubscriptionDetails = (p) => {
  if (!p) return { planName: 'Free / Inactive', planId: 'none', creditsRemaining: 0, creditsTotal: 0, unlockedCount: 0, paymentId: null, isActive: false };

  const sub = p.subscription || {};
  const planId = sub.planId || p.planId || 'none';
  const planName = sub.planName || p.subscriptionPlan || (planId !== 'none' ? `${planId.toUpperCase()} Plan` : null) || 'Free / Inactive';
  const creditsRemaining = typeof sub.creditsRemaining === 'number' ? sub.creditsRemaining : (typeof p.creditsRemaining === 'number' ? p.creditsRemaining : 0);
  const creditsTotal = typeof sub.creditsTotal === 'number' ? sub.creditsTotal : (typeof p.creditsTotal === 'number' ? p.creditsTotal : 0);
  const unlockedProfiles = sub.unlockedProfiles || p.unlockedProfiles || [];
  const unlockedCount = Array.isArray(unlockedProfiles) ? unlockedProfiles.length : 0;
  const paymentId = sub.paymentId || p.paymentId || null;
  const activatedAt = sub.activatedAt || p.activatedAt || null;

  const isActive = (planId !== 'none' && planName !== 'Free / Inactive') || creditsRemaining > 0;

  return {
    planId,
    planName,
    creditsRemaining,
    creditsTotal,
    unlockedCount,
    paymentId,
    activatedAt,
    isActive
  };
};

export const AdminPage = ({ onNavigate }) => {
  const { isAuthenticated, isAdmin, loginAsAdmin } = useAuth();
  const { t } = useLanguage();
  const { 
    profiles, 
    toggleVerifyProfile, 
    toggleBlockProfile,
    createAdminProfile,
    updateAdminProfile, 
    deleteProfile,
    homeContent,
    updateHomeContent,
    stories,
    addSuccessStory,
    updateSuccessStory,
    deleteSuccessStory,
    inquiries,
    toggleResolveInquiry,
    deleteInquiry,
    addToast 
  } = useProfiles();

  const [activeTab, setActiveTab] = useState('profiles'); // 'overview', 'profiles', 'content', 'stories', 'inquiries'

  // Profile Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [blockStatusFilter, setBlockStatusFilter] = useState('all'); // 'all', 'active', 'blocked'
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all'); // 'all', 'active', 'basic', 'standard', 'premium', 'free'

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const INITIAL_NEW_PROFILE = {
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'female',
    age: '24',
    dob: '',
    height: '5\' 6" (168 cm)',
    maritalStatus: 'Never Married',
    religion: 'Hindu',
    caste: 'Maratha',
    motherTongue: 'Marathi',
    district: 'Kolhapur',
    city: 'Ichalkaranji',
    nativePlace: '',
    education: 'B.E. / B.Tech',
    college: '',
    occupation: 'Software Engineer / IT Professional',
    company: '',
    income: '₹ 8 - 12 Lakhs per annum',
    fatherOccupation: '',
    motherOccupation: '',
    siblings: '',
    familyType: 'Nuclear Family',
    diet: 'Vegetarian',
    smoking: 'No',
    drinking: 'No',
    aboutMe: '',
    avatar: null,
    photos: [],
    biodataPdf: null,
    verified: true,
    subPlanId: 'none',
    subCreditsTotal: 0,
    subCreditsRemaining: 0
  };

  const [newProfileForm, setNewProfileForm] = useState(INITIAL_NEW_PROFILE);

  const handleOpenCreateModal = () => {
    let nextRegNum = 1015;
    if (profiles && profiles.length > 0) {
      const existingNums = profiles.map(p => {
        const num = Number(String(p.registrationId || p.regId || '').replace(/[^0-9]/g, ''));
        return isNaN(num) ? 0 : num;
      });
      nextRegNum = Math.max(...existingNums, 1000) + 1;
    }
    setNewProfileForm({
      ...INITIAL_NEW_PROFILE,
      regId: `SS-${nextRegNum}`
    });
    setShowCreateModal(true);
  };

  const handleNewAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const storageUrl = await uploadPhotoToFirebase(file, `new_${Date.now()}`, 'avatars');
      setNewProfileForm((prev) => ({ ...prev, avatar: storageUrl }));
      addToast('Profile picture uploaded to Firebase Storage!', 'success');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload image.');
    }
  };

  const handleNewGalleryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const storageUrl = await uploadPhotoToFirebase(file, `new_${Date.now()}`, 'photos');
      setNewProfileForm((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), storageUrl]
      }));
      addToast('Gallery photo uploaded to Firebase Storage!', 'success');
    } catch (err) {
      console.error('Gallery photo upload failed:', err);
      alert('Failed to upload image.');
    }
  };

  const handleRemoveNewGalleryPhoto = (index) => {
    setNewProfileForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleNewBiodataUpload = async (e) => {
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

    try {
      const firebaseStorageUrl = await uploadBiodataPdfToFirebase(file, `new_${Date.now()}`);
      const newBiodata = {
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileType: isImage ? 'image' : 'pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        url: firebaseStorageUrl
      };

      setNewProfileForm((prev) => ({ ...prev, biodataPdf: newBiodata }));
      addToast('Biodata uploaded to Firebase Storage!', 'success');
    } catch (err) {
      console.error('Biodata upload failed:', err);
      alert('Failed to upload Biodata file.');
    }
  };

  const handleCreateProfileSubmit = async (e) => {
    e.preventDefault();
    if (!newProfileForm.name || !newProfileForm.name.trim()) {
      alert('Please enter full candidate name.');
      return;
    }

    const planObj = SUBSCRIPTION_PLANS.find(p => p.id === newProfileForm.subPlanId);
    let subscription = null;

    if (newProfileForm.subPlanId !== 'none' && planObj) {
      subscription = {
        planId: planObj.id,
        planName: `${planObj.name} Plan`,
        creditsTotal: Number(newProfileForm.subCreditsTotal || planObj.visits),
        creditsRemaining: Number(newProfileForm.subCreditsRemaining || planObj.visits),
        unlockedProfiles: [],
        paymentId: `admin_created_${Date.now()}`,
        activatedAt: new Date().toISOString()
      };
    } else {
      subscription = {
        planId: 'none',
        planName: 'Free / Inactive',
        creditsTotal: 0,
        creditsRemaining: 0,
        unlockedProfiles: [],
        paymentId: null,
        activatedAt: null
      };
    }

    const profilePayload = {
      ...newProfileForm,
      subscription
    };

    await createAdminProfile(profilePayload);
    setShowCreateModal(false);
    setNewProfileForm(INITIAL_NEW_PROFILE);
  };

  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const isAnyModalOpen = showAddStoryModal || showEditStoryModal || showEditModal || showCreateModal;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

  // Homepage Content Editable Form State
  const [editableHomeContent, setEditableHomeContent] = useState(homeContent);

  React.useEffect(() => {
    setEditableHomeContent(homeContent);
  }, [homeContent]);

  // New Success Story Form
  const [newStoryData, setNewStoryData] = useState({
    names: '',
    location: 'Ichalkaranji & Kolhapur',
    quote: '“We found our perfect life partner through Sambodhi Sarang Marriage Bureau!”',
    weddingDate: 'February 2026 • Ichalkaranji Wedding Hall',
    photos: []
  });

  // Bureau Contact Info (Editable)
  const [contactInfo, setContactInfo] = useState({
    phone: '+91 9823425404',
    email: 'pk9823435404@gmail.com',
    address: 'Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra'
  });

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-plum/10 text-brand-plum rounded-3xl flex items-center justify-center mx-auto border border-brand-rose/30 shadow-md">
          <Lock className="w-8 h-8 text-brand-plum" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-brand-plum">Sambodhi Sarang Admin Portal</h1>
          <p className="text-xs sm:text-sm text-brand-gray">
            This area is restricted exclusively to Sambodhi Sarang Marriage Bureau administrators.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-300 p-6 rounded-3xl space-y-4 max-w-md mx-auto text-left shadow-lg">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-brand-plum" />
            <span>Administrator Quick Access</span>
          </div>
          <p className="text-xs text-amber-800">
            Click below to instantly authenticate as <strong>Sambodhi Sarang Administrator</strong> for complete platform management testing.
          </p>
          <button
            onClick={() => loginAsAdmin()}
            className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-2 border border-brand-rose/40"
          >
            <span>Login as Bureau Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Filtered profiles logic
  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const digitsQ = q.replace(/[^0-9]/g, '');
    const pDigits = (String(p.regId || '') + String(p.registrationId || '') + String(p.id || '')).replace(/[^0-9]/g, '');

    const matchesSearch = 
      p.name?.toLowerCase().includes(q) ||
      p.caste?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.occupation?.toLowerCase().includes(q) ||
      (p.regId && p.regId.toLowerCase().includes(q)) ||
      (p.registrationId && String(p.registrationId).includes(q)) ||
      (digitsQ.length > 0 && pDigits.includes(digitsQ));

    const pGender = (p.gender || '').toLowerCase().trim();
    const matchesGender = genderFilter === 'all' || pGender === genderFilter.toLowerCase();
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && p.verified) || 
      (verificationFilter === 'unverified' && !p.verified);

    const matchesDistrict = districtFilter === 'all' || p.district === districtFilter;
    const matchesBlockStatus = 
      blockStatusFilter === 'all' || 
      (blockStatusFilter === 'active' && !p.blocked) || 
      (blockStatusFilter === 'blocked' && !!p.blocked);

    const subDetails = getSubscriptionDetails(p);
    const matchesSubscription = 
      subscriptionFilter === 'all' || 
      (subscriptionFilter === 'active' && subDetails.isActive) || 
      (subscriptionFilter === 'free' && !subDetails.isActive) ||
      (subscriptionFilter.toLowerCase() === subDetails.planId.toLowerCase());

    return matchesSearch && matchesGender && matchesVerification && matchesBlockStatus && matchesDistrict && matchesSubscription;
  });

  const verifiedCount = profiles.filter((p) => p.verified).length;
  const unverifiedCount = profiles.filter((p) => !p.verified).length;
  const blockedCount = profiles.filter((p) => p.blocked).length;
  const activeSubscriptionsCount = profiles.filter((p) => getSubscriptionDetails(p).isActive).length;

  const handleOpenEdit = (p) => {
    const sub = p.subscription || {};
    setEditingProfile({
      ...p,
      subPlanId: sub.planId || 'none',
      subCreditsRemaining: typeof sub.creditsRemaining === 'number' ? sub.creditsRemaining : (p.creditsRemaining || 0),
      subCreditsTotal: typeof sub.creditsTotal === 'number' ? sub.creditsTotal : (p.creditsTotal || 0),
      subPaymentId: sub.paymentId || p.paymentId || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditedProfile = (e) => {
    e.preventDefault();
    if (!editingProfile) return;

    const planObj = SUBSCRIPTION_PLANS.find(sp => sp.id === editingProfile.subPlanId);
    
    let updatedSub = null;
    if (editingProfile.subPlanId === 'none') {
      updatedSub = {
        planId: 'none',
        planName: 'Free / Inactive',
        creditsTotal: 0,
        creditsRemaining: 0,
        unlockedProfiles: editingProfile.subscription?.unlockedProfiles || [],
        paymentId: null,
        activatedAt: null
      };
    } else {
      updatedSub = {
        planId: editingProfile.subPlanId,
        planName: planObj ? `${planObj.name} Plan` : (editingProfile.subPlanId.toUpperCase() + ' Plan'),
        creditsTotal: Number(editingProfile.subCreditsTotal || (planObj ? planObj.visits : 25)),
        creditsRemaining: Number(editingProfile.subCreditsRemaining || 0),
        unlockedProfiles: editingProfile.subscription?.unlockedProfiles || [],
        paymentId: editingProfile.subPaymentId || editingProfile.subscription?.paymentId || `admin_grant_${Date.now()}`,
        activatedAt: editingProfile.subscription?.activatedAt || new Date().toISOString()
      };
    }

    const finalProfileToSave = {
      ...editingProfile,
      subscription: updatedSub
    };

    updateAdminProfile(editingProfile.id, finalProfileToSave);
    setShowEditModal(false);
    setEditingProfile(null);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const storageUrl = await uploadPhotoToFirebase(file, editingProfile?.id || 'admin_edit', 'avatars');
      setEditingProfile((prev) => ({ ...prev, avatar: storageUrl }));
      addToast('Profile photo uploaded to Firebase Storage!', 'success');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload image to Firebase Storage.');
    }
  };

  const handleRemoveAvatar = () => {
    setEditingProfile((prev) => ({ ...prev, avatar: null, photos: [] }));
  };

  const handleAddGalleryPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const storageUrl = await uploadPhotoToFirebase(file, editingProfile?.id || 'admin_edit', 'photos');
      setEditingProfile((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), storageUrl]
      }));
      addToast('Gallery photo uploaded to Firebase Storage!', 'success');
    } catch (err) {
      console.error('Gallery photo upload failed:', err);
      alert('Failed to upload gallery photo to Firebase Storage.');
    }
  };

  const handleRemoveGalleryPhoto = (index) => {
    setEditingProfile((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleAdminBiodataUpload = async (e) => {
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

    try {
      const firebaseStorageUrl = await uploadBiodataPdfToFirebase(file, editingProfile?.id || 'admin_edit');
      const newBiodata = {
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileType: isImage ? 'image' : 'pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        url: firebaseStorageUrl
      };

      setEditingProfile((prev) => ({ ...prev, biodataPdf: newBiodata }));
      addToast('Biodata uploaded to Firebase Storage successfully!', 'success');
    } catch (err) {
      console.error('Error uploading biodata in Admin:', err);
      alert('Failed to upload Biodata file to Firebase Storage.');
    }
  };

  const handleAdminRemoveBiodata = () => {
    if (window.confirm('Are you sure you want to remove this member\'s Biodata?')) {
      setEditingProfile((prev) => ({ ...prev, biodataPdf: null }));
      addToast('Biodata removed from profile.', 'info');
    }
  };

  const handleSaveHomeContent = (e) => {
    e.preventDefault();
    updateHomeContent(editableHomeContent);
  };

  const handleAddStoryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const storageUrl = await uploadStoryPhotoToFirebase(file);
      setNewStoryData((prev) => ({
        ...prev,
        photos: [...(prev?.photos || []), { url: storageUrl, caption: `${prev?.names || 'Couple'} Wedding` }]
      }));
      addToast('Photo added to new story gallery!', 'success');
    } catch (err) {
      console.error('Error uploading story photo to Firebase Storage:', err);
      alert('Failed to upload story photo to Firebase Storage.');
    }
  };

  const handleRemoveAddStoryPhoto = (index) => {
    setNewStoryData((prev) => ({
      ...prev,
      photos: (prev?.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleEditStoryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const storageUrl = await uploadStoryPhotoToFirebase(file);
      setEditingStory((prev) => ({
        ...prev,
        photos: [...(prev?.photos || []), { url: storageUrl, caption: `${prev?.names || 'Couple'} Wedding` }]
      }));
      addToast('Photo added to story gallery!', 'success');
    } catch (err) {
      console.error('Error uploading story photo to Firebase Storage:', err);
      alert('Failed to upload story photo to Firebase Storage.');
    }
  };

  const handleRemoveEditStoryPhoto = (index) => {
    setEditingStory((prev) => ({
      ...prev,
      photos: (prev?.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleOpenEditStory = (story) => {
    let photoArray = [];
    if (Array.isArray(story.photos) && story.photos.length > 0) {
      photoArray = story.photos.map((p) =>
        typeof p === 'string' ? { url: p, caption: '' } : { url: p.url || p.src || '', caption: p.caption || '' }
      ).filter(p => !!p.url);
    } else if (story.photoUrl) {
      photoArray = [{ url: story.photoUrl, caption: '' }];
    } else {
      photoArray = [{ url: '/story1.jpg', caption: '' }];
    }

    setEditingStory({
      id: story.id,
      names: story.names || '',
      location: story.location || '',
      quote: story.quote || '',
      weddingDate: story.weddingDate || '',
      photos: photoArray
    });
    setShowEditStoryModal(true);
  };

  const handleSaveEditedStory = (e) => {
    e.preventDefault();
    if (!editingStory) return;
    if (!editingStory.photos || editingStory.photos.length === 0) {
      alert('Please upload at least 1 wedding photo for this story.');
      return;
    }
    const cleanPhotos = editingStory.photos.map((p) =>
      typeof p === 'string' ? { url: p, caption: `${editingStory.names} Wedding` } : { url: p.url, caption: p.caption || `${editingStory.names} Wedding` }
    );
    updateSuccessStory(editingStory.id, {
      names: editingStory.names,
      location: editingStory.location,
      quote: editingStory.quote,
      weddingDate: editingStory.weddingDate,
      photos: cleanPhotos
    });
    setShowEditStoryModal(false);
    setEditingStory(null);
  };

  const handleSaveNewStory = (e) => {
    e.preventDefault();
    if (!newStoryData.photos || newStoryData.photos.length === 0) {
      alert('Please upload at least 1 wedding photo from device.');
      return;
    }
    const cleanPhotos = newStoryData.photos.map((p) =>
      typeof p === 'string' ? { url: p, caption: `${newStoryData.names} Wedding` } : { url: p.url, caption: p.caption || `${newStoryData.names} Wedding` }
    );
    addSuccessStory({
      names: newStoryData.names,
      location: newStoryData.location,
      quote: newStoryData.quote,
      weddingDate: newStoryData.weddingDate,
      photos: cleanPhotos
    });
    setShowAddStoryModal(false);
    setNewStoryData({
      names: '',
      location: 'Ichalkaranji & Kolhapur',
      quote: '“We found our perfect life partner through Sambodhi Sarang Marriage Bureau!”',
      weddingDate: 'February 2026 • Ichalkaranji Wedding Hall',
      photos: []
    });
  };

  const handleSaveContactInfo = (e) => {
    e.preventDefault();
    addToast('Bureau contact details updated across website!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-plum via-brand-plumDark to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-brand-rose/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sambodhi Sarang Bureau Control Panel</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-gray-200">
            Manage website content, homepage headlines, member verification badges, and support inquiries.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-brand-rose/20 pb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Overview Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'profiles'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Profile Management ({profiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'content'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Manage Homepage Content</span>
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'stories'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Success Stories ({stories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'inquiries'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Support Inquiries ({inquiries.filter(i => !i.resolved).length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-gray uppercase">Total Profiles</span>
                <Users className="w-6 h-6 text-brand-plum" />
              </div>
              <p className="font-serif text-3xl font-bold text-brand-plum">{profiles.length}</p>
              <p className="text-[11px] text-gray-500">Active registered members</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-gray uppercase">Active Subscriptions</span>
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-amber-600">{activeSubscriptionsCount}</p>
              <p className="text-[11px] text-gray-500 font-medium">Paid plan members</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-gray uppercase">Verified Profiles</span>
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-emerald-600">{verifiedCount}</p>
              <p className="text-[11px] text-gray-500">Screened & mobile verified</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-gray uppercase">Unverified / Pending</span>
                <XCircle className="w-6 h-6 text-amber-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-amber-600">{unverifiedCount}</p>
              <p className="text-[11px] text-gray-500">Awaiting bureau check</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-gray uppercase">Support Messages</span>
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-indigo-600">{inquiries.length}</p>
              <p className="text-[11px] text-gray-500">{inquiries.filter(i=>!i.resolved).length} unresolved inquiry</p>
            </div>

          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            <h3 className="font-serif font-bold text-lg text-brand-plum">Quick Bureau Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setActiveTab('profiles');
                  handleOpenCreateModal();
                }}
                className="p-4 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white rounded-2xl border border-brand-gold/40 transition-all font-bold text-xs flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4 text-brand-gold" />
                <span>Create New Profile (नवीन नोंदणी)</span>
              </button>

              <button
                onClick={() => setActiveTab('profiles')}
                className="p-4 bg-brand-lightBg hover:bg-brand-plum hover:text-white rounded-2xl border border-brand-rose/20 transition-all font-bold text-xs flex items-center justify-center space-x-2 text-brand-plum"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify / Manage Profiles & Subscriptions</span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className="p-4 bg-brand-lightBg hover:bg-brand-plum hover:text-white rounded-2xl border border-brand-rose/20 transition-all font-bold text-xs flex items-center justify-center space-x-2 text-brand-plum"
              >
                <Layout className="w-4 h-4" />
                <span>Edit Homepage Content & Headlines</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILES MANAGEMENT */}
      {activeTab === 'profiles' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Search & Filter Controls */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            
            {/* Top Row: Search & Active Filter Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-brand-gray absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, caste, district, Profile No..."
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum bg-slate-50/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Badge, Reset & Create Button */}
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 border border-brand-gold/40 shrink-0"
                >
                  <Plus className="w-4 h-4 text-brand-gold" />
                  <span>Create New Profile</span>
                </button>
                <span className="text-xs font-semibold text-brand-plum bg-brand-lightBg px-3 py-1.5 rounded-xl border border-brand-rose/20">
                  Showing <strong>{filteredProfiles.length}</strong> of <strong>{profiles.length}</strong> Profiles
                </span>
                {(searchQuery || genderFilter !== 'all' || verificationFilter !== 'all' || blockStatusFilter !== 'all' || districtFilter !== 'all' || subscriptionFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setGenderFilter('all');
                      setVerificationFilter('all');
                      setBlockStatusFilter('all');
                      setDistrictFilter('all');
                      setSubscriptionFilter('all');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

            </div>

            {/* Filter Grid: 5 Equal Responsive Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subscription Plan
                </label>
                <select
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                >
                  <option value="all">All Subscription Plans</option>
                  <option value="active">👑 Paid Subscriptions Only</option>
                  <option value="basic">Basic Plan (₹1,100)</option>
                  <option value="standard">Standard Plan (₹2,100)</option>
                  <option value="premium">Premium Plan (₹3,100)</option>
                  <option value="free">Free / No Active Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Candidate Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                >
                  <option value="all">All Genders</option>
                  <option value="female">Brides (Female)</option>
                  <option value="male">Grooms (Male)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Verification Status
                </label>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Account Status
                </label>
                <select
                  value={blockStatusFilter}
                  onChange={(e) => setBlockStatusFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Members Only</option>
                  <option value="blocked">Blocked Members Only 🚫</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  District / Region
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                >
                  <option value="all">All Districts</option>
                  <option value="Ichalkaranji">Ichalkaranji</option>
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Profiles Table */}
          <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-lightBg text-brand-plum font-serif border-b border-brand-rose/20">
                  <tr>
                    <th className="p-4 font-bold">Member Name</th>
                    <th className="p-4 font-bold">Gender & Age</th>
                    <th className="p-4 font-bold">Location & Caste</th>
                    <th className="p-4 font-bold">Occupation & Income</th>
                    <th className="p-4 font-bold">Subscription & Visits</th>
                    <th className="p-4 font-bold">Verification Badge</th>
                    <th className="p-4 font-bold">Account Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredProfiles.map((p) => {
                    const subDetails = getSubscriptionDetails(p);

                    return (
                    <tr key={p.id} className={`transition-colors ${p.blocked ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-brand-ivory/50'}`}>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {p.avatar || (Array.isArray(p.photos) && p.photos[0]) ? (
                            <img
                              src={p.avatar || p.photos[0]}
                              alt={p.name}
                              className="w-10 h-10 rounded-full object-cover border border-brand-rose/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-lightBg border border-brand-rose/30 flex items-center justify-center text-brand-plum font-bold shrink-0">
                              <User className="w-5 h-5 text-brand-plum/50" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-brand-plum">{p.name}</p>
                              {p.blocked && (
                                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded">
                                  BLOCKED
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-brand-kesari">Profile No. {p.regId || `SS-${p.registrationId || 1001}`}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="capitalize font-semibold">{p.gender}</span> • {p.age} yrs
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-brand-charcoal">{p.district}</p>
                        <p className="text-[10px] text-brand-gray">{p.caste}</p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-brand-charcoal">{p.occupation || 'Professional'}</p>
                        <p className="text-[10px] text-brand-gray">{p.income || 'Confidential'}</p>
                      </td>

                      <td className="p-4">
                        {subDetails.isActive ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border ${
                                subDetails.planId === 'premium'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : subDetails.planId === 'standard'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              }`}>
                                <Crown className="w-3 h-3 fill-current shrink-0 text-amber-600" />
                                <span>{subDetails.planName}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs font-bold text-slate-800">
                              <Eye className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                              <span>{subDetails.creditsRemaining} / {subDetails.creditsTotal} Left</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">
                              Unlocked: {subDetails.unlockedCount} profiles
                              {subDetails.paymentId && ` • Txn: ${String(subDetails.paymentId).substring(0, 12)}...`}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-semibold text-[10px] inline-block border border-gray-200">
                              Free / No Active Plan
                            </span>
                            <p className="text-[10px] text-gray-400">0 Visits Left</p>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => toggleVerifyProfile(p.id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${
                            p.verified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                          title="Click to toggle verified badge"
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${p.verified ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span>{p.verified ? 'Verified' : 'Unverified (Click)'}</span>
                        </button>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => toggleBlockProfile(p.id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${
                            p.blocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          }`}
                          title="Click to toggle block/active status"
                        >
                          {p.blocked ? (
                            <>
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>Blocked (Unblock)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active Profile</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleBlockProfile(p.id)}
                            className={`p-2 rounded-xl transition-all ${
                              p.blocked
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                            title={p.blocked ? 'Unblock Member' : 'Block Member'}
                          >
                            {p.blocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5 text-rose-600" />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete profile for ${p.name}?`)) {
                                deleteProfile(p.id);
                              }
                            }}
                            className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-all"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {filteredProfiles.length === 0 && (
              <div className="p-8 text-center text-xs text-brand-gray">
                No profiles match your current search or filter criteria.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: MANAGE HOMEPAGE CONTENT */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Homepage Content Form */}
          <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <Layout className="w-5 h-5 text-brand-plum" />
                <h3 className="font-serif font-bold text-xl text-brand-plum">Edit Homepage Text & Headlines</h3>
              </div>
              <span className="text-xs text-brand-gray font-medium">Updates live site immediately</span>
            </div>

            <form onSubmit={handleSaveHomeContent} className="space-y-6 text-xs">
              
              {/* Hero Banner Section */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                <h4 className="font-bold text-brand-plum text-sm uppercase tracking-wider">1. Hero Banner Headlines</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Hero Tagline Badge *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.heroBadge}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, heroBadge: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Main English Title *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.heroTitle}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, heroTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Marathi Quote Subtitle *</label>
                  <input
                    type="text"
                    required
                    value={editableHomeContent.heroTitleMr}
                    onChange={(e) => setEditableHomeContent({ ...editableHomeContent, heroTitleMr: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-brand-plum"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hero Paragraph Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={editableHomeContent.heroSubtext}
                    onChange={(e) => setEditableHomeContent({ ...editableHomeContent, heroSubtext: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 font-medium"
                  />
                </div>
              </div>

              {/* Right Side Glass Card Content */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                <h4 className="font-bold text-brand-plum text-sm uppercase tracking-wider">2. Right Side Feature Card Text</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Card Header Title *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.rightCardTitle}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, rightCardTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Card Marathi Subtitle *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.rightCardSubtitle}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, rightCardSubtitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Card Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={editableHomeContent.rightCardDesc}
                    onChange={(e) => setEditableHomeContent({ ...editableHomeContent, rightCardDesc: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 font-medium"
                  />
                </div>
              </div>

              {/* Trust Indicators Text */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                <h4 className="font-bold text-brand-plum text-sm uppercase tracking-wider">3. Trust Badges Text</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Badge 1 Text *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.verifiedProfilesCountText}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, verifiedProfilesCountText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Badge 2 Text *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.happyCouplesCountText}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, happyCouplesCountText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Badge 3 Text *</label>
                    <input
                      type="text"
                      required
                      value={editableHomeContent.privacyProtectedText}
                      onChange={(e) => setEditableHomeContent({ ...editableHomeContent, privacyProtectedText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-lg hover:bg-brand-plumDark transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Homepage Content Changes</span>
              </button>
            </form>
          </div>

          {/* Contact Details Form */}
          <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-brand-plum" />
              <h3 className="font-serif font-bold text-xl text-brand-plum">Bureau Contact & Address Management</h3>
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Bureau Helpline Number *</label>
                  <input
                    type="text"
                    required
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-brand-charcoal"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Bureau Official Email ID *</label>
                  <input
                    type="email"
                    required
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-brand-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bureau Address *</label>
                <input
                  type="text"
                  required
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-brand-charcoal"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Contact Details</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 4: SUCCESS STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-brand-plum">Manage Success Stories</h3>
            <button
              onClick={() => setShowAddStoryModal(true)}
              className="px-4 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Success Story</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-3xl overflow-hidden border border-brand-rose/20 shadow-luxury p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <img src={story.photos?.[0]?.url || '/story1.jpg'} alt={story.names} className="w-full h-44 object-cover rounded-2xl" />
                  <h4 className="font-serif font-bold text-base text-brand-plum">{story.names}</h4>
                  <p className="text-xs text-brand-gray italic">{story.quote}</p>
                  <span className="text-[10px] text-brand-plum font-semibold block">{story.weddingDate}</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEditStory(story)}
                    className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold"
                    title="Edit Success Story"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete story for ${story.names}?`)) {
                        deleteSuccessStory(story.id);
                      }
                    }}
                    className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold"
                    title="Delete Success Story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 5: SUPPORT INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-brand-plum">Customer Helpline & Inquiries</h3>
                <p className="text-xs text-slate-500">Live support messages submitted by website visitors and candidates</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl">
                {inquiries.filter(i => !i.resolved).length} Unresolved
              </span>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-gray space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600">No support inquiries yet.</p>
                <p className="text-slate-400">When visitors fill out the Contact Us form, their messages will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      inq.resolved ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-brand-lightBg/60 border-brand-rose/30 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1 text-xs flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-brand-plum text-sm">{inq.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{inq.date}</span>
                      </div>
                      <p className="text-brand-charcoal font-medium leading-relaxed bg-white/60 p-3 rounded-xl border border-gray-100 mt-1">
                        “{inq.message}”
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-brand-gray pt-1">
                        <span className="flex items-center space-x-1 font-semibold text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-brand-plum" />
                          <span>{inq.phone}</span>
                        </span>
                        <span className="flex items-center space-x-1 font-semibold text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-brand-plum" />
                          <span>{inq.email}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => toggleResolveInquiry(inq.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          inq.resolved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-brand-plum text-white shadow hover:bg-brand-plumDark'
                        }`}
                      >
                        {inq.resolved ? '✓ Resolved' : 'Mark as Resolved'}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete inquiry from ${inq.name}?`)) {
                            deleteInquiry(inq.id);
                          }
                        }}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all border border-rose-200"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD SUCCESS STORY */}
      {showAddStoryModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-brand-rose/30 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-brand-plum">Add Success Story</h3>
              <button onClick={() => setShowAddStoryModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveNewStory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Couple Names *</label>
                <input
                  type="text"
                  required
                  value={newStoryData.names}
                  onChange={(e) => setNewStoryData({ ...newStoryData, names: e.target.value })}
                  placeholder="e.g. Snehal & Swapnil"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={newStoryData.location}
                  onChange={(e) => setNewStoryData({ ...newStoryData, location: e.target.value })}
                  placeholder="e.g. Ichalkaranji & Kolhapur"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Quote / Review *</label>
                <textarea
                  rows={2}
                  required
                  value={newStoryData.quote}
                  onChange={(e) => setNewStoryData({ ...newStoryData, quote: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Wedding Date & Venue *</label>
                <input
                  type="text"
                  required
                  value={newStoryData.weddingDate}
                  onChange={(e) => setNewStoryData({ ...newStoryData, weddingDate: e.target.value })}
                  placeholder="e.g. February 2026 • Ichalkaranji Wedding Hall"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-slate-800">Wedding Photo Gallery ({newStoryData.photos?.length || 0}) *</label>
                <div className="flex flex-wrap items-center gap-3">
                  {(newStoryData.photos || []).map((photoObj, idx) => {
                    const pUrl = typeof photoObj === 'string' ? photoObj : photoObj.url;
                    return (
                      <div key={idx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white shrink-0">
                        <img src={pUrl} alt={`Wedding photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveAddStoryPhoto(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 transition-all"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-brand-rose/40 hover:border-brand-plum bg-brand-lightBg/50 hover:bg-brand-rose/10 cursor-pointer flex flex-col items-center justify-center text-brand-plum transition-all shadow-sm shrink-0">
                    <Camera className="w-5 h-5 text-brand-plum mb-1" />
                    <span className="text-[10px] font-bold text-center px-1">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddStoryPhotoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddStoryModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-plum text-white font-bold shadow hover:bg-brand-plumDark"
                >
                  Save Success Story
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL: EDIT SUCCESS STORY */}
      {showEditStoryModal && editingStory && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-brand-rose/30 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-brand-plum">Edit Success Story</h3>
              <button onClick={() => setShowEditStoryModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedStory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Couple Names *</label>
                <input
                  type="text"
                  required
                  value={editingStory.names}
                  onChange={(e) => setEditingStory({ ...editingStory, names: e.target.value })}
                  placeholder="e.g. Snehal & Swapnil"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={editingStory.location}
                  onChange={(e) => setEditingStory({ ...editingStory, location: e.target.value })}
                  placeholder="e.g. Ichalkaranji & Kolhapur"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Quote / Review *</label>
                <textarea
                  rows={2}
                  required
                  value={editingStory.quote}
                  onChange={(e) => setEditingStory({ ...editingStory, quote: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Wedding Date & Venue *</label>
                <input
                  type="text"
                  required
                  value={editingStory.weddingDate}
                  onChange={(e) => setEditingStory({ ...editingStory, weddingDate: e.target.value })}
                  placeholder="e.g. February 2026 • Ichalkaranji Wedding Hall"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-slate-800">Wedding Photo Gallery ({editingStory.photos?.length || 0}) *</label>
                <div className="flex flex-wrap items-center gap-3">
                  {(editingStory.photos || []).map((photoObj, idx) => {
                    const pUrl = typeof photoObj === 'string' ? photoObj : photoObj.url;
                    return (
                      <div key={idx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white shrink-0">
                        <img src={pUrl} alt={`Wedding photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditStoryPhoto(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 transition-all"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-brand-rose/40 hover:border-brand-plum bg-brand-lightBg/50 hover:bg-brand-rose/10 cursor-pointer flex flex-col items-center justify-center text-brand-plum transition-all shadow-sm shrink-0">
                    <Camera className="w-5 h-5 text-brand-plum mb-1" />
                    <span className="text-[10px] font-bold text-center px-1">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditStoryPhotoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditStoryModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-plum text-white font-bold shadow hover:bg-brand-plumDark"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL: EDIT PROFILE */}
      {showEditModal && editingProfile && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-brand-rose/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-plum">Edit Member Profile (Admin)</h3>
                <p className="text-xs text-gray-500">Profile No. #{editingProfile.regId || editingProfile.id}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProfile} className="space-y-6 text-xs">
              
              {/* SECTION 1: PROFILE PICTURE & VERIFICATION */}
              <div className="bg-brand-lightBg/50 p-4 sm:p-6 rounded-2xl border border-brand-rose/20 space-y-4">
                <h4 className="font-bold text-sm text-brand-plum border-b border-brand-rose/20 pb-2 flex flex-wrap items-center justify-between gap-3">
                  <span>1. Profile Picture, Verification & Block Status</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-emerald-700">
                      <input
                        type="checkbox"
                        checked={!!editingProfile.verified}
                        onChange={(e) => setEditingProfile({ ...editingProfile, verified: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Verified Profile</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!editingProfile.blocked}
                        onChange={(e) => setEditingProfile({ ...editingProfile, blocked: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Block Profile (🚫 सस्पेंड करा)</span>
                    </label>
                  </div>
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    {editingProfile.avatar || (Array.isArray(editingProfile.photos) && editingProfile.photos.length > 0) ? (
                      <img
                        src={editingProfile.avatar || editingProfile.photos[0]}
                        alt={editingProfile.name || 'Profile'}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-brand-rose/30 shadow-md bg-white"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-brand-lightBg border-2 border-dashed border-brand-rose/30 flex flex-col items-center justify-center text-brand-plum shadow-inner">
                        <User className="w-10 h-10 text-brand-plum/40" />
                        <span className="text-[10px] text-gray-400 font-semibold mt-1">No Profile Photo</span>
                      </div>
                    )}
                    {editingProfile.verified && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow z-10">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="px-4 py-2 bg-brand-plum text-white rounded-xl font-bold cursor-pointer hover:bg-brand-plumDark transition-all flex items-center space-x-1.5 shadow-sm">
                        <Camera className="w-4 h-4" />
                        <span>Upload / Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      {(editingProfile.avatar || (Array.isArray(editingProfile.photos) && editingProfile.photos.length > 0)) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-all flex items-center space-x-1 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">Supports JPG, PNG, WEBP. Compressed automatically before saving.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERSONAL & DEMOGRAPHICS */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  2. Personal & Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProfile.name || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Gender *</label>
                    <select
                      value={String(editingProfile.gender || 'female').toLowerCase()}
                      onChange={(e) => setEditingProfile({ ...editingProfile, gender: e.target.value.toLowerCase(), lookingFor: e.target.value.toLowerCase() })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum font-medium"
                    >
                      <option value="female">Bride (Female / वधू)</option>
                      <option value="male">Groom (Male / वर)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Age *</label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="80"
                      value={editingProfile.age || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, age: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={editingProfile.dob || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, dob: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Height</label>
                    <select
                      value={editingProfile.height || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, height: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="">Select Height</option>
                      {HEIGHT_OPTIONS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Marital Status</label>
                    <select
                      value={editingProfile.maritalStatus || 'Never Married'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, maritalStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: RELIGION, CASTE & LOCATION */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  3. Religion, Caste & Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Religion</label>
                    <select
                      value={RELIGIONS.includes(editingProfile.religion) ? editingProfile.religion : (editingProfile.religion ? 'Other' : 'Hindu')}
                      onChange={(e) => setEditingProfile({ ...editingProfile, religion: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      {RELIGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Caste / Community *</label>
                    <input
                      type="text"
                      required
                      value={editingProfile.caste || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, caste: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                      placeholder="e.g. Maratha, Brahmin, Lingayat..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Mother Tongue</label>
                    <input
                      type="text"
                      value={editingProfile.motherTongue || 'Marathi'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, motherTongue: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">District *</label>
                    <select
                      value={editingProfile.district || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, district: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="">Select District</option>
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">City / Area</label>
                    <input
                      type="text"
                      value={editingProfile.city || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                      placeholder="e.g. Ichalkaranji, Kothrud"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Native Place (मूळ गाव)</label>
                    <input
                      type="text"
                      value={editingProfile.nativePlace || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, nativePlace: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                      placeholder="e.g. Shirol, Hatkanangale"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: EDUCATION & CAREER */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  4. Education & Profession
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Education Degree</label>
                    <input
                      type="text"
                      value={editingProfile.education || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, education: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                      placeholder="e.g. B.E. Computer Science, MBA"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">College / Institute</label>
                    <input
                      type="text"
                      value={editingProfile.college || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, college: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Occupation / Job</label>
                    <input
                      type="text"
                      value={editingProfile.occupation || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, occupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                      placeholder="e.g. Software Engineer, Doctor"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Company / Organization</label>
                    <input
                      type="text"
                      value={editingProfile.company || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Annual Income</label>
                    <select
                      value={editingProfile.income || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, income: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="">Select Income Range</option>
                      {INCOME_RANGES.map((inc) => (
                        <option key={inc} value={inc}>{inc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 5: FAMILY & LIFESTYLE */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  5. Family Background & Lifestyle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Father's Occupation</label>
                    <input
                      type="text"
                      value={editingProfile.fatherOccupation || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, fatherOccupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Mother's Occupation</label>
                    <input
                      type="text"
                      value={editingProfile.motherOccupation || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, motherOccupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Family Type</label>
                    <select
                      value={editingProfile.familyType || 'Nuclear Family'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, familyType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="Nuclear Family">Nuclear Family</option>
                      <option value="Joint Family">Joint Family</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Siblings Details</label>
                    <input
                      type="text"
                      value={editingProfile.siblings || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, siblings: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                      placeholder="e.g. 1 Brother, 1 Sister"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Dietary Habit</label>
                    <select
                      value={editingProfile.diet || 'Vegetarian'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, diet: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Jain">Jain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Smoking / Drinking</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editingProfile.smoking || 'No'}
                        onChange={(e) => setEditingProfile({ ...editingProfile, smoking: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                      >
                        <option value="No">Smoke: No</option>
                        <option value="Yes">Smoke: Yes</option>
                        <option value="Occasionally">Smoke: Occasion</option>
                      </select>
                      <select
                        value={editingProfile.drinking || 'No'}
                        onChange={(e) => setEditingProfile({ ...editingProfile, drinking: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                      >
                        <option value="No">Drink: No</option>
                        <option value="Yes">Drink: Yes</option>
                        <option value="Occasionally">Drink: Occasion</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">About Profile / Bio (स्वपरिचय)</label>
                  <textarea
                    rows={3}
                    value={editingProfile.aboutMe || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, aboutMe: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum text-xs"
                    placeholder="Brief bio, family background, aspirations..."
                  />
                </div>
              </div>

              {/* SECTION 6: PHOTO GALLERY */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1 flex items-center justify-between">
                  <span>6. Photo Gallery</span>
                  <label className="px-3 py-1 bg-brand-lightBg hover:bg-brand-rose/20 text-brand-plum rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1 border border-brand-rose/30 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Gallery Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddGalleryPhoto}
                      className="hidden"
                    />
                  </label>
                </h4>
                {(!editingProfile.photos || editingProfile.photos.length === 0) ? (
                  <p className="text-gray-400 italic text-[11px]">No gallery photos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {editingProfile.photos.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 7: BIODATA DOCUMENT (PDF / PHOTO) */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-brand-kesari" />
                    <span>7. Candidate Biodata Document (PDF / Photo)</span>
                  </span>
                </h4>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  {editingProfile.biodataPdf ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-brand-plum text-brand-gold flex items-center justify-center font-bold text-xs shrink-0">
                          {editingProfile.biodataPdf.fileType === 'image' ? 'IMG' : 'PDF'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-brand-plum text-xs truncate">
                            {editingProfile.biodataPdf.fileName || 'Biodata Document'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {editingProfile.biodataPdf.fileSize || 'File'} • Uploaded {editingProfile.biodataPdf.uploadedAt || 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {editingProfile.biodataPdf.url && (
                          <a
                            href={editingProfile.biodataPdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-gold" />
                            <span>View Document</span>
                          </a>
                        )}

                        <label className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-100 transition-all flex items-center space-x-1">
                          <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                          <span>Replace File</span>
                          <input
                            type="file"
                            accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
                            onChange={handleAdminBiodataUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleAdminRemoveBiodata}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div>
                        <p className="text-xs font-bold text-brand-plum">No Biodata Document Uploaded</p>
                        <p className="text-[11px] text-gray-500">Upload candidate's PDF or Image biodata file directly to Firebase Storage.</p>
                      </div>

                      <label className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-brand-plumDark transition-all flex items-center space-x-1.5 shrink-0">
                        <UploadCloud className="w-4 h-4 text-brand-gold" />
                        <span>Upload Biodata (PDF / IMG)</span>
                        <input
                          type="file"
                          accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
                          onChange={handleAdminBiodataUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 8: SUBSCRIPTION PLAN & PROFILE VISIT CREDITS */}
              <div className="bg-amber-50/80 p-4 sm:p-6 rounded-2xl border border-amber-300/80 space-y-4 shadow-sm">
                <h4 className="font-bold text-sm text-amber-950 border-b border-amber-200 pb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>8. Subscription Plan & Profile Visit Credits (Admin Management)</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Grant / Modify Subscriptions
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Active Membership Plan</label>
                    <select
                      value={editingProfile.subPlanId || 'none'}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const found = SUBSCRIPTION_PLANS.find(p => p.id === selectedId);
                        setEditingProfile(prev => ({
                          ...prev,
                          subPlanId: selectedId,
                          subCreditsTotal: found ? found.visits : (selectedId === 'none' ? 0 : 25),
                          subCreditsRemaining: found ? found.visits : (selectedId === 'none' ? 0 : 25)
                        }));
                      }}
                      className="w-full p-2.5 rounded-xl border border-amber-300 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="none">Free / No Active Plan</option>
                      {SUBSCRIPTION_PLANS.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} Plan (₹{plan.price} — {plan.visits} Visits)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Remaining Visit Credits</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={editingProfile.subCreditsRemaining ?? 0}
                      onChange={(e) => setEditingProfile({ ...editingProfile, subCreditsRemaining: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-extrabold text-emerald-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Total Plan Credits</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={editingProfile.subCreditsTotal ?? 0}
                      onChange={(e) => setEditingProfile({ ...editingProfile, subCreditsTotal: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Payment ID / Reference</label>
                    <input
                      type="text"
                      value={editingProfile.subPaymentId || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, subPaymentId: e.target.value })}
                      placeholder="e.g. pay_12345 or Cash"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 font-mono text-xs bg-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 font-medium italic">
                  * Bureau Admin can instantly upgrade plans, grant credits for offline cash registrations, or adjust visit limits for candidates.
                </p>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-plum text-white font-bold shadow-md hover:bg-brand-plumDark transition-all flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* CREATE NEW MEMBER PROFILE MODAL (ADMIN) */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white max-w-4xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto border border-brand-rose/20">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-plum text-brand-gold flex items-center justify-center font-bold shadow shrink-0">
                  <Plus className="w-6 h-6 text-brand-gold stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-plum">
                    Create New Member Profile (नवीन सदस्य नोंदणी)
                  </h3>
                  <p className="text-xs text-brand-gray font-medium">
                    Register a complete candidate profile with login credentials, photos, biodata & subscription.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProfileSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1: ACCOUNT CREDENTIALS & IDENTITY */}
              <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-brand-kesari" />
                  <span>1. Account Login Credentials & Identity (खाता व लॉगिन माहिती)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Mobile Number / Email (लॉगिन आयडी) *</label>
                    <input
                      type="text"
                      required
                      value={newProfileForm.phone}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, phone: e.target.value })}
                      placeholder="e.g. 9823000000 or email@gmail.com"
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Initial Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newProfileForm.password}
                        onChange={(e) => setNewProfileForm({ ...newProfileForm, password: e.target.value })}
                        placeholder="Assign initial password"
                        className="w-full pl-3 pr-9 py-2.5 bg-white rounded-xl border border-slate-300 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs font-mono text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-brand-plum"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={newProfileForm.email}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, email: e.target.value })}
                      placeholder="member@gmail.com"
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Profile No.</label>
                    <input
                      type="text"
                      value={newProfileForm.regId}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, regId: e.target.value })}
                      placeholder="Auto generated e.g. SS-1016"
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 font-mono text-xs font-bold text-brand-plum"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PHOTOS & MEDIA UPLOADS (FIREBASE STORAGE) */}
              <div className="bg-amber-50/60 p-4 sm:p-6 rounded-2xl border border-amber-200 space-y-4">
                <h4 className="font-bold text-sm text-amber-950 border-b border-amber-200 pb-2 flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>2. Candidate Photos (Direct Firebase Storage Upload)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Primary Profile Photo */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-gray-800">Primary Profile Photo (avatar)</label>
                    <div className="flex items-center space-x-4">
                      {newProfileForm.avatar ? (
                        <img
                          src={newProfileForm.avatar}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-gold shadow bg-white"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="px-4 py-2 bg-brand-plum text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-brand-plumDark transition-all inline-flex items-center space-x-1.5 shadow-sm">
                          <UploadCloud className="w-4 h-4 text-brand-gold" />
                          <span>Upload Avatar</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewAvatarUpload}
                            className="hidden"
                          />
                        </label>
                        {newProfileForm.avatar && (
                          <button
                            type="button"
                            onClick={() => setNewProfileForm((prev) => ({ ...prev, avatar: null }))}
                            className="block text-[11px] text-rose-600 font-semibold hover:underline"
                          >
                            Remove avatar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Photo Gallery */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-gray-800">Photo Gallery Images ({newProfileForm.photos?.length || 0})</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {(newProfileForm.photos || []).map((img, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewGalleryPhoto(idx)}
                            className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <label className="w-14 h-14 rounded-xl border-2 border-dashed border-brand-rose/40 hover:border-brand-plum bg-white cursor-pointer flex flex-col items-center justify-center text-brand-plum transition-all shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewGalleryPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BIODATA PDF / IMAGE DOCUMENT */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-slate-200 pb-2 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-brand-kesari" />
                  <span>3. Biodata Document Attachment (PDF / Photo)</span>
                </h4>

                {newProfileForm.biodataPdf ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileText className="w-6 h-6 text-brand-plum shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-brand-plum text-xs truncate">{newProfileForm.biodataPdf.fileName}</p>
                        <p className="text-[10px] text-gray-400">{newProfileForm.biodataPdf.fileSize} • Uploaded {newProfileForm.biodataPdf.uploadedAt}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewProfileForm((prev) => ({ ...prev, biodataPdf: null }))}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-100"
                    >
                      Remove Biodata
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-gray-500">Upload candidate's PDF or Image biodata file directly to Firebase Storage</span>
                    <label className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-brand-plumDark transition-all flex items-center space-x-1.5 shrink-0">
                      <UploadCloud className="w-4 h-4 text-brand-gold" />
                      <span>Upload Biodata PDF/IMG</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleNewBiodataUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* SECTION 4: BASIC PERSONAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  4. Basic Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newProfileForm.name}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, name: e.target.value })}
                      placeholder="Candidate Full Name"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Gender *</label>
                    <select
                      value={newProfileForm.gender}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, gender: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 font-semibold"
                    >
                      <option value="female">Bride (Female / वधू)</option>
                      <option value="male">Groom (Male / वर)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Age *</label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="80"
                      value={newProfileForm.age}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, age: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={newProfileForm.dob}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, dob: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Height</label>
                    <select
                      value={newProfileForm.height}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, height: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      {HEIGHT_OPTIONS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Marital Status</label>
                    <select
                      value={newProfileForm.maritalStatus}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, maritalStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 5: RELIGION, CASTE & LOCATION */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  5. Religion, Caste & Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Religion</label>
                    <select
                      value={newProfileForm.religion}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, religion: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      {RELIGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Caste / Community *</label>
                    <input
                      type="text"
                      required
                      value={newProfileForm.caste}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, caste: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                      placeholder="e.g. Maratha, Brahmin, Lingayat..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Mother Tongue</label>
                    <input
                      type="text"
                      value={newProfileForm.motherTongue}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, motherTongue: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">District *</label>
                    <select
                      value={newProfileForm.district}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, district: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">City / Area</label>
                    <input
                      type="text"
                      value={newProfileForm.city}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                      placeholder="e.g. Ichalkaranji, Kothrud"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Native Place (मूळ गाव)</label>
                    <input
                      type="text"
                      value={newProfileForm.nativePlace}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, nativePlace: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                      placeholder="e.g. Shirol, Sangli"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: EDUCATION & PROFESSION */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  6. Education & Career
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Degree</label>
                    <input
                      type="text"
                      value={newProfileForm.education}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, education: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">College / University</label>
                    <input
                      type="text"
                      value={newProfileForm.college}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, college: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Occupation</label>
                    <input
                      type="text"
                      value={newProfileForm.occupation}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, occupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Company</label>
                    <input
                      type="text"
                      value={newProfileForm.company}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Annual Income Range</label>
                    <select
                      value={newProfileForm.income}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, income: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      {INCOME_RANGES.map((inc) => (
                        <option key={inc} value={inc}>{inc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 7: FAMILY & BIO */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-brand-plum border-b border-gray-100 pb-1">
                  7. Family Background & Lifestyle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Father's Occupation</label>
                    <input
                      type="text"
                      value={newProfileForm.fatherOccupation}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, fatherOccupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Mother's Occupation</label>
                    <input
                      type="text"
                      value={newProfileForm.motherOccupation}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, motherOccupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Family Type</label>
                    <select
                      value={newProfileForm.familyType}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, familyType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      <option value="Nuclear Family">Nuclear Family</option>
                      <option value="Joint Family">Joint Family</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">About Candidate / Bio</label>
                  <textarea
                    rows={3}
                    value={newProfileForm.aboutMe}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, aboutMe: e.target.value })}
                    placeholder="Brief family background, partner preferences..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              {/* SECTION 8: VERIFICATION & SUBSCRIPTION SETUP */}
              <div className="bg-amber-50/80 p-4 sm:p-6 rounded-2xl border border-amber-300/80 space-y-4 shadow-sm">
                <h4 className="font-bold text-sm text-amber-950 border-b border-amber-200 pb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>8. Verification & Membership Subscription Grant</span>
                  </div>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    <input
                      type="checkbox"
                      checked={newProfileForm.verified}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, verified: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>Verified Badge</span>
                  </label>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Assign Subscription Plan</label>
                    <select
                      value={newProfileForm.subPlanId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const found = SUBSCRIPTION_PLANS.find(p => p.id === selectedId);
                        setNewProfileForm(prev => ({
                          ...prev,
                          subPlanId: selectedId,
                          subCreditsTotal: found ? found.visits : 0,
                          subCreditsRemaining: found ? found.visits : 0
                        }));
                      }}
                      className="w-full p-2.5 rounded-xl border border-amber-300 font-bold text-slate-900 bg-white"
                    >
                      <option value="none">Free / No Active Plan</option>
                      {SUBSCRIPTION_PLANS.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} Plan (₹{plan.price} — {plan.visits} Visits)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Remaining Visit Credits</label>
                    <input
                      type="number"
                      min="0"
                      value={newProfileForm.subCreditsRemaining}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, subCreditsRemaining: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-emerald-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">Total Plan Credits</label>
                    <input
                      type="number"
                      min="0"
                      value={newProfileForm.subCreditsTotal}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, subCreditsTotal: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER SUBMIT ACTIONS */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 border border-brand-gold/40"
                >
                  <Save className="w-4 h-4 text-brand-gold" />
                  <span>Create Candidate Profile</span>
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
