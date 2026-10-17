import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { WatermarkOverlay } from '../components/common/WatermarkOverlay';
import { useProfiles, sortProfilesByLatest } from '../context/ProfileContext';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { DISTRICTS, normalizeDistrict, MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS, INCOME_RANGES, HEIGHT_OPTIONS } from '../data/maharashtraData';
import { compressImage } from '../utils/imageCompressor';
import { calculateAgeFromDob } from '../utils/ageCalculator';
import { uploadPhotoToFirebase, uploadStoryPhotoToFirebase, uploadPopupPhotoToFirebase, uploadBiodataPdfToFirebase, optimizeAndCompressExistingProfileMedia } from '../services/firebaseService';
import { SiteAnnouncementModal } from '../components/common/SiteAnnouncementModal';
import { doesProfileHavePhone } from '../utils/phoneUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  EyeOff,
  Award,
  UploadCloud,
  Loader2,
  Key,
  RefreshCw,
  FileSpreadsheet,
  Download,
  SlidersHorizontal,
  ShieldAlert,
  Flag,
  AlertTriangle,
  ExternalLink,
  Megaphone
} from 'lucide-react';

export const getSubscriptionDetails = (p) => {
  if (!p) return { planName: 'Free / Inactive', planId: 'none', creditsRemaining: 0, creditsTotal: 0, unlockedCount: 0, paymentId: null, isActive: false };

  const sub = p.subscription || {};
  const rawPlanId = String(sub.planId || p.planId || 'none').toLowerCase().trim();

  // Explicit Plan Visit Limits: Basic = 25, Standard = 50, Premium = 75
  const PLAN_VISITS_MAP = {
    basic: 25,
    standard: 50,
    premium: 75
  };

  const defaultVisits = PLAN_VISITS_MAP[rawPlanId] || (rawPlanId !== 'none' ? 25 : 0);
  const planId = rawPlanId;
  const planName = sub.planName || p.subscriptionPlan || (planId !== 'none' ? `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan` : 'Free / Inactive');

  const unlockedProfiles = sub.unlockedProfiles || p.unlockedProfiles || [];

  // Deduplicate unlocked profiles by primary ID group so 1 profile = 1 count
  const uniqueProfileSet = new Set();
  if (Array.isArray(unlockedProfiles)) {
    unlockedProfiles.forEach(item => {
      if (!item) return;
      const str = String(item).toLowerCase().trim();
      const numPart = str.replace(/[^0-9]/g, '');
      if (numPart) {
        uniqueProfileSet.add(`id_${numPart}`);
      } else {
        uniqueProfileSet.add(str);
      }
    });
  }

  const unlockedCount = uniqueProfileSet.size;

  // Total visits limit (Basic = 25, Standard = 50, Premium = 75 unless custom set by admin)
  const creditsTotal = typeof sub.creditsTotal === 'number' && sub.creditsTotal > 0
    ? sub.creditsTotal
    : defaultVisits;

  // Remaining visits MUST BE EXACTLY: creditsTotal - unlockedCount!
  const creditsRemaining = planId === 'none' && creditsTotal === 0
    ? 0
    : Math.max(0, creditsTotal - unlockedCount);

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
  const { isAuthenticated, isAdmin, loginAsAdmin, login } = useAuth();
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
    subscriptionPlans,
    updateSubscriptionPlans,
    addToast,
    reports = [],
    resolveReport,
    dismissReport,
    warnUser,
    removeViolatingContent,
    deletionRequests = [],
    processDeletionRequest,
    dismissDeletionRequest
  } = useProfiles();

  // Moderation state
  const [reportStatusFilter, setReportStatusFilter] = useState('pending'); // 'all', 'pending', 'resolved', 'dismissed'
  const [reportTypeFilter, setReportTypeFilter] = useState('all'); // 'all', 'profile', 'photo', 'message'
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [warnTarget, setWarnTarget] = useState(null); // { reportId, targetUserId, targetName }
  const [warnMessageInput, setWarnMessageInput] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionTarget, setActionTarget] = useState(null); // { report, actionType: 'resolve' | 'dismiss' }
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Deletion Requests state
  const [deletionStatusFilter, setDeletionStatusFilter] = useState('pending'); // 'all', 'pending', 'completed', 'dismissed'
  const [deletionSearchQuery, setDeletionSearchQuery] = useState('');
  const [selectedDeletionReq, setSelectedDeletionReq] = useState(null);
  const [showProcessDeletionModal, setShowProcessDeletionModal] = useState(false);
  const [deletionAdminNote, setDeletionAdminNote] = useState('');
  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false);

  const pendingReportsCount = (reports || []).filter(r => r.status === 'pending').length;
  const resolvedReportsCount = (reports || []).filter(r => r.status === 'resolved').length;
  const dismissedReportsCount = (reports || []).filter(r => r.status === 'dismissed').length;
  const pendingChildSafetyCount = (reports || []).filter(r => (r.isChildSafety || r.priority === 'critical') && r.status === 'pending').length;
  const suspendedProfilesCount = profiles.filter(p => p.blocked).length;

  const pendingDeletionsCount = (deletionRequests || []).filter(r => r.status === 'pending').length;
  const completedDeletionsCount = (deletionRequests || []).filter(r => r.status === 'completed').length;

  const filteredDeletions = useMemo(() => {
    let list = [...(deletionRequests || [])];
    if (deletionStatusFilter !== 'all') {
      list = list.filter(r => r.status === deletionStatusFilter);
    }
    if (deletionSearchQuery.trim()) {
      const q = deletionSearchQuery.toLowerCase().trim();
      list = list.filter(r => 
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.memberId && r.memberId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [deletionRequests, deletionStatusFilter, deletionSearchQuery]);

  const filteredAndSortedReports = useMemo(() => {
    let list = [...(reports || [])];

    if (reportStatusFilter !== 'all') {
      list = list.filter(r => r.status === reportStatusFilter);
    }

    if (reportTypeFilter === 'child_safety') {
      list = list.filter(r => r.isChildSafety || r.priority === 'critical');
    } else if (reportTypeFilter !== 'all') {
      list = list.filter(r => r.targetType === reportTypeFilter);
    }

    if (reportSearchQuery.trim()) {
      const q = reportSearchQuery.toLowerCase().trim();
      list = list.filter(r => 
        (r.reporterName && r.reporterName.toLowerCase().includes(q)) ||
        (r.targetName && r.targetName.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.details && r.details.toLowerCase().includes(q)) ||
        (r.reporterId && String(r.reporterId).toLowerCase().includes(q)) ||
        (r.targetId && String(r.targetId).toLowerCase().includes(q)) ||
        (r.id && String(r.id).toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      // 1. Critical / Child Safety pending reports ALWAYS come FIRST
      const aChildSafetyPending = (a.isChildSafety || a.priority === 'critical') && a.status === 'pending' ? 1 : 0;
      const bChildSafetyPending = (b.isChildSafety || b.priority === 'critical') && b.status === 'pending' ? 1 : 0;
      if (aChildSafetyPending !== bChildSafetyPending) return bChildSafetyPending - aChildSafetyPending;

      // 2. Other pending reports next
      const aPending = a.status === 'pending' ? 1 : 0;
      const bPending = b.status === 'pending' ? 1 : 0;
      if (aPending !== bPending) return bPending - aPending;

      // 3. Newest timestamp first
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  }, [reports, reportStatusFilter, reportTypeFilter, reportSearchQuery]);

  const handleOpenWarnModal = (report) => {
    setWarnTarget({
      reportId: report.id,
      targetUserId: report.targetId,
      targetName: report.targetName || 'Member'
    });
    setWarnMessageInput(`You have received an official warning from Sambodhi Sarang administration regarding violation of community guidelines (${report.reason || 'Safety Policy'}). Repeated violations will lead to permanent account suspension.`);
    setShowWarnModal(true);
  };

  const handleSendWarnSubmit = async (e) => {
    e.preventDefault();
    if (!warnTarget) return;
    const msg = warnMessageInput.trim();
    if (!msg) {
      alert('Please enter a warning message.');
      return;
    }
    await warnUser(warnTarget.targetUserId, msg, 'Safety Policy');
    await resolveReport(warnTarget.reportId, 'resolved', 'warned', `Issued formal bureau warning: "${msg}"`);
    setShowWarnModal(false);
    setWarnTarget(null);
    setWarnMessageInput('');
    addToast('Official warning issued and report marked as resolved.', 'success');
  };

  const handleRemoveContent = async (report) => {
    if (!report) return;
    if (!window.confirm(`Are you sure you want to remove the reported ${report.targetType}?`)) {
      return;
    }

    if (report.targetType === 'photo') {
      await removeViolatingContent('photo', report.targetId, { photoUrl: report.evidencePhotoUrl });
      await resolveReport(report.id, 'resolved', 'content_removed', 'Removed violating photo from candidate profile.');
      addToast('Violating photo removed and report resolved.', 'success');
    } else if (report.targetType === 'message') {
      const chatId = [String(report.reporterId), String(report.targetId)].sort().join('_');
      await removeViolatingContent('message', report.targetId, { messageId: report.messageId, chatId });
      await resolveReport(report.id, 'resolved', 'content_removed', 'Removed violating chat message.');
      addToast('Violating message deleted and report resolved.', 'success');
    }
  };

  const handleToggleSuspendAccount = async (targetId, report = null) => {
    const targetProfile = profiles.find(p => String(p.id) === String(targetId));
    const isCurrentlyBlocked = Boolean(targetProfile?.blocked);
    const actionLabel = isCurrentlyBlocked ? 'unsuspend / activate' : 'suspend / block';
    
    if (!window.confirm(`Are you sure you want to ${actionLabel} account for ${targetProfile?.name || targetId}?`)) {
      return;
    }

    toggleBlockProfile(targetId);
    if (report && !isCurrentlyBlocked) {
      await resolveReport(report.id, 'resolved', 'account_suspended', `Account suspended by administration.`);
    }
  };

  const handleOpenActionModal = (report, actionType) => {
    setActionTarget({ report, actionType });
    setAdminNoteInput('');
    setShowActionModal(true);
  };

  const handleActionModalSubmit = async (e) => {
    e.preventDefault();
    if (!actionTarget) return;
    const { report, actionType } = actionTarget;
    const notes = adminNoteInput.trim() || (actionType === 'resolve' ? 'Resolved after review.' : 'Dismissed after review.');
    
    if (actionType === 'resolve') {
      await resolveReport(report.id, {
        status: 'resolved',
        actionTaken: 'resolved',
        adminNotes: notes,
        resolvedBy: 'Admin'
      });
    } else {
      if (typeof dismissReport === 'function') {
        await dismissReport(report.id, notes);
      } else {
        await resolveReport(report.id, {
          status: 'dismissed',
          actionTaken: 'dismissed',
          adminNotes: notes,
          resolvedBy: 'Admin'
        });
      }
    }

    setShowActionModal(false);
    setActionTarget(null);
    setAdminNoteInput('');
  };

  const [activeTab, setActiveTab] = useState('profiles'); // 'overview', 'profiles', 'content', 'popup', 'stories', 'inquiries', 'plans', 'export', 'moderation'
  const [showPopupPreview, setShowPopupPreview] = useState(false);
  const [isUploadingPopupImage, setIsUploadingPopupImage] = useState(false);
  const [editablePlans, setEditablePlans] = useState(() => {
    return subscriptionPlans || SUBSCRIPTION_PLANS;
  });

  useEffect(() => {
    if (subscriptionPlans && subscriptionPlans.length > 0) {
      setEditablePlans(subscriptionPlans);
    }
  }, [subscriptionPlans]);

  const handlePlanPriceChange = (planId, field, value) => {
    setEditablePlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            [field]: field === 'price' || field === 'visits' ? (isNaN(Number(value)) ? 0 : Number(value)) : value
          };
        }
        return plan;
      })
    );
  };

  const handleSaveSubscriptionPlans = (e) => {
    e.preventDefault();
    updateSubscriptionPlans(editablePlans);
  };

  const handleResetSubscriptionPlans = () => {
    if (window.confirm('Reset all subscription plan rates to original default values?')) {
      setEditablePlans(SUBSCRIPTION_PLANS);
      updateSubscriptionPlans(SUBSCRIPTION_PLANS);
    }
  };

  // Photo Optimization State
  const [isOptimizingPhotos, setIsOptimizingPhotos] = useState(false);
  const [optimizingProgress, setOptimizingProgress] = useState('');

  const handleOptimizeAllPhotos = async () => {
    if (!window.confirm('Optimize & compress all existing candidate photos? This scans profiles in Firestore and compresses large photos down to ~100KB for lightning-fast loading.')) {
      return;
    }

    setIsOptimizingPhotos(true);
    setOptimizingProgress('Starting...');
    addToast('Starting candidate photo optimization...', 'info');

    try {
      const res = await optimizeAndCompressExistingProfileMedia(profiles, (curr, total, name) => {
        setOptimizingProgress(`${curr}/${total}`);
      });
      addToast(`Optimization finished! ${res.updatedCount} photos compressed.`, 'success');
      alert(`Optimization complete! ${res.updatedCount} photos were compressed and updated.`);
    } catch (err) {
      console.error('Optimization error:', err);
      addToast('Error during optimization: ' + err.message, 'error');
    } finally {
      setIsOptimizingPhotos(false);
      setOptimizingProgress('');
    }
  };

  // Profile Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [blockStatusFilter, setBlockStatusFilter] = useState('all'); // 'all', 'active', 'blocked'
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all'); // 'all', 'active', 'basic', 'standard', 'premium', 'free'

  // Profile Export & Filter Section State
  const [exportCasteFilter, setExportCasteFilter] = useState('all');
  const [exportCasteQuery, setExportCasteQuery] = useState('');
  const [exportGenderFilter, setExportGenderFilter] = useState('all');
  const [exportMinAge, setExportMinAge] = useState(18);
  const [exportMaxAge, setExportMaxAge] = useState(60);
  const [exportSortBy, setExportSortBy] = useState('id_asc');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Reset User Password Modal State
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [resetPassTarget, setResetPassTarget] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showResetPasswordText, setShowResetPasswordText] = useState(false);

  const handleOpenResetPassword = (profile) => {
    setResetPassTarget(profile);
    setNewPasswordVal(profile.password || '123456');
    setShowResetPasswordText(false);
    setShowResetPassModal(true);
  };

  const handleSaveResetPassword = (e) => {
    e.preventDefault();
    if (!resetPassTarget) return;

    const trimmedPass = newPasswordVal.trim();
    if (!trimmedPass) {
      alert('Please enter a valid password.');
      return;
    }
    if (trimmedPass.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }

    updateAdminProfile(resetPassTarget.id, { password: trimmedPass });
    addToast(`Password for ${resetPassTarget.name} (SS-${resetPassTarget.registrationId || resetPassTarget.regId}) updated to: "${trimmedPass}"`, 'success');
    setShowResetPassModal(false);
    setResetPassTarget(null);
    setNewPasswordVal('');
  };

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
    isGovtEmployee: 'No',
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
    expectations: '',
    avatar: null,
    photos: [],
    biodataPdf: null,
    verified: true,
    subPlanId: 'none',
    subCreditsTotal: 0,
    subCreditsRemaining: 0
  };

  const [newProfileForm, setNewProfileForm] = useState(INITIAL_NEW_PROFILE);
  const newBiodataFileInputRef = useRef(null);
  const editBiodataFileInputRef = useRef(null);

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
    } finally {
      if (e.target) e.target.value = '';
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

    const candidatePhone = (newProfileForm.phone || newProfileForm.mobile || '').trim();
    if (candidatePhone) {
      const isDuplicate = profiles.some(p => doesProfileHavePhone(p, candidatePhone));
      if (isDuplicate) {
        alert('This Mobile Number is already registered with an existing profile! Only 1 registration per mobile number is allowed.');
        return;
      }
    }

    const profilePayload = {
      ...newProfileForm,
      subscription
    };

    const created = await createAdminProfile(profilePayload);
    if (!created) {
      return;
    }
    setShowCreateModal(false);
    setNewProfileForm(INITIAL_NEW_PROFILE);
  };

  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const isAnyModalOpen = showAddStoryModal || showEditStoryModal || showEditModal || showCreateModal || showResetPassModal;
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
    email: 'pk9823425404@gmail.com',
    address: 'Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra'
  });

  // Admin Login States
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false);

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      setAdminLoginError('Please enter both Admin Email ID and Password.');
      return;
    }
    const res = login(adminEmailInput, adminPasswordInput);
    if (!res.success) {
      setAdminLoginError(res.message || 'Invalid Admin Email ID or Password.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-plum/10 text-brand-plum rounded-3xl flex items-center justify-center mx-auto border border-brand-rose/30 shadow-md">
            <Lock className="w-8 h-8 text-brand-plum" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            Sambodhi Sarang Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-brand-gray">
            This area is restricted exclusively to Sambodhi Sarang Marriage Bureau administrators. Please authenticate to continue.
          </p>
        </div>

        <form onSubmit={handleAdminLoginSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
          {adminLoginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Admin Email ID / आयडी
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Admin Password / पासवर्ड
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showAdminPasswordInput ? 'text' : 'password'}
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 text-xs font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
              />
              <button
                type="button"
                onClick={() => setShowAdminPasswordInput(!showAdminPasswordInput)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-plum"
              >
                {showAdminPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-brand-plum via-brand-plumDark to-brand-plum text-white font-bold text-xs sm:text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
          >
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>Login to Admin Control Panel</span>
          </button>
        </form>
      </div>
    );
  }

  // Filtered profiles logic (latest profiles appear on top)
  const filteredProfiles = sortProfilesByLatest(profiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();

    let matchesSearch = true;
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);
      const digitsQ = q.replace(/[^0-9]/g, '');
      const pDigits = (String(p.regId || '') + String(p.registrationId || '') + String(p.id || '') + String(p.phone || '')).replace(/[^0-9]/g, '');

      // 1. Direct ID or contact digits match
      const matchesDigits = digitsQ.length > 0 && pDigits.includes(digitsQ);

      // 2. Direct full string substring match
      const nameEn = String(p.name || '').toLowerCase();
      const nameMr = String(p.nameMr || p.marathiName || '').toLowerCase();
      const fullName = `${nameEn} ${nameMr}`.trim();

      const directSubstringMatch = 
        fullName.includes(q) ||
        String(p.caste || '').toLowerCase().includes(q) ||
        String(p.district || '').toLowerCase().includes(q) ||
        String(p.occupation || '').toLowerCase().includes(q) ||
        String(p.education || '').toLowerCase().includes(q) ||
        String(p.regId || '').toLowerCase().includes(q) ||
        String(p.registrationId || '').toLowerCase().includes(q);

      // 3. Multi-word / Name + Surname matching (e.g. "Rahul Patil" matches "Rahul Ramesh Patil")
      // Check if all tokens entered by admin are found in the candidate's name (in any order)
      const allTokensInName = tokens.length > 0 && tokens.every(token => fullName.includes(token));

      // 4. Combined profile searchable fields matching (e.g. "Rahul Kolhapur" matches Rahul from Kolhapur)
      const searchableProfileText = [
        fullName,
        p.caste,
        p.subcaste,
        p.district,
        p.city,
        p.nativePlace,
        p.occupation,
        p.education,
        p.regId,
        p.registrationId,
        p.phone,
        p.email
      ].filter(Boolean).join(' ').toLowerCase();

      const allTokensInProfile = tokens.length > 0 && tokens.every(token => searchableProfileText.includes(token));

      matchesSearch = matchesDigits || directSubstringMatch || allTokensInName || allTokensInProfile;
    }

    const pGender = (p.gender || '').toLowerCase().trim();
    const matchesGender = genderFilter === 'all' || pGender === genderFilter.toLowerCase();
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && p.verified) || 
      (verificationFilter === 'unverified' && !p.verified);

    const matchesDistrict = districtFilter === 'all' || 
      p.district === districtFilter || 
      (p.district && districtFilter.toLowerCase().includes(p.district.toLowerCase())) ||
      (p.district && p.district.toLowerCase().includes(districtFilter.toLowerCase())) ||
      (p.district && normalizeDistrict(p.district) === districtFilter);
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
  }));

  const verifiedCount = profiles.filter((p) => p.verified).length;
  const unverifiedCount = profiles.filter((p) => !p.verified).length;
  const blockedCount = profiles.filter((p) => p.blocked).length;
  const activeSubscriptionsCount = profiles.filter((p) => getSubscriptionDetails(p).isActive).length;

  const handleOpenEdit = (p) => {
    const sub = p.subscription || {};
    const cRem = typeof sub.creditsRemaining === 'number' ? sub.creditsRemaining : (p.creditsRemaining || 0);
    const cTot = typeof sub.creditsTotal === 'number' ? sub.creditsTotal : (p.creditsTotal || 0);
    setEditingProfile({
      ...p,
      subPlanId: sub.planId || 'none',
      subCreditsRemaining: cRem,
      subCreditsTotal: Math.max(cTot, cRem),
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
      const cRem = Math.max(0, Number(editingProfile.subCreditsRemaining || 0));
      const defaultVisits = planObj ? planObj.visits : 25;
      const cTot = Math.max(cRem, Number(editingProfile.subCreditsTotal || defaultVisits));

      updatedSub = {
        planId: editingProfile.subPlanId,
        planName: planObj ? `${planObj.name} Plan` : (editingProfile.subPlanId.toUpperCase() + ' Plan'),
        creditsTotal: cTot,
        creditsRemaining: cRem,
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
    setEditingProfile((prev) => ({ ...prev, avatar: '/default-avatar.png', photos: [] }));
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
    } finally {
      if (e.target) e.target.value = '';
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

  const handlePopupImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('कृपया वैध फोटो निवडा (JPG, PNG, WEBP).');
      return;
    }
    setIsUploadingPopupImage(true);
    try {
      const storageUrl = await uploadPopupPhotoToFirebase(file);
      const updated = {
        ...editableHomeContent,
        popupAd: {
          ...(editableHomeContent?.popupAd || {}),
          imageUrl: storageUrl,
          enabled: true,
          updatedAt: new Date().toISOString()
        }
      };
      setEditableHomeContent(updated);
      updateHomeContent(updated);
      addToast('पॉप-अप फोटो अपलोड झाला आणि सक्रिय केला गेला!', 'success');
    } catch (err) {
      console.error('Popup upload failed:', err);
      alert('फोटो अपलोड अयशस्वी: ' + (err.message || 'त्रुटी'));
    } finally {
      setIsUploadingPopupImage(false);
      e.target.value = '';
    }
  };

  const handleRemovePopupImage = () => {
    if (!window.confirm('तुम्हाला खरोखर हा पॉप-अप फोटो काढून टाकायचा आहे का?')) return;
    const updated = {
      ...editableHomeContent,
      popupAd: {
        ...(editableHomeContent?.popupAd || {}),
        imageUrl: '',
        enabled: false,
        updatedAt: new Date().toISOString()
      }
    };
    setEditableHomeContent(updated);
    updateHomeContent(updated);
    addToast('पॉप-अप फोटो काढण्यात आला.', 'info');
  };

  const handleTogglePopupActive = () => {
    const isCurrentlyActive = Boolean(editableHomeContent?.popupAd?.enabled);
    if (!isCurrentlyActive && !editableHomeContent?.popupAd?.imageUrl) {
      alert('कृपया प्रथम पॉप-अपसाठी फोटो अपलोड करा.');
      return;
    }
    const updated = {
      ...editableHomeContent,
      popupAd: {
        ...(editableHomeContent?.popupAd || {}),
        enabled: !isCurrentlyActive,
        updatedAt: new Date().toISOString()
      }
    };
    setEditableHomeContent(updated);
    updateHomeContent(updated);
    addToast(
      !isCurrentlyActive ? 'पॉप-अप जाहिरात सक्रिय केली!' : 'पॉप-अप जाहिरात बंद केली.',
      !isCurrentlyActive ? 'success' : 'info'
    );
  };

  const handleSavePopupSettingsOnly = (e) => {
    if (e) e.preventDefault();
    updateHomeContent(editableHomeContent);
    addToast('पॉप-अप सेटिंग्ज यशस्वीरित्या सेव्ह केल्या!', 'success');
  };

  const renderPopupAdManagerCard = () => (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-plum">
              वेबसाइट पॉप-अप जाहिरात / सूचना (Site Announcement Popup Ad)
            </h3>
            <p className="text-xs text-brand-gray font-medium">
              येथे जाहिरातीचा किंवा सूचनेचा फोटो अपलोड करा. युजरने वेबसाइट उघडल्यावर हा फोटो पॉप-अप म्हणून दिसेल आणि त्याला बंद (Cancel) करण्याचे बटण असेल.
            </p>
          </div>
        </div>

        {/* Status & Preview Button */}
        <div className="flex items-center space-x-2 shrink-0">
          {editableHomeContent?.popupAd?.enabled && editableHomeContent?.popupAd?.imageUrl ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              सक्रिय (Active on Site)
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
              ⚪ बंद (Inactive)
            </span>
          )}

          {editableHomeContent?.popupAd?.imageUrl && (
            <button
              type="button"
              onClick={() => setShowPopupPreview(true)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-lightBg hover:bg-brand-rose/20 text-brand-plum text-xs font-bold transition-colors flex items-center space-x-1.5 border border-brand-rose/30 shadow-sm"
              title="Preview exactly how visitors see it"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>थेट पाहा (Preview)</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 text-xs">
        {/* 1. Toggle Active / Inactive */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-lightBg to-amber-50/40 border border-brand-rose/20">
          <div>
            <h4 className="font-bold text-sm text-brand-charcoal">
              पॉप-अप चालू / बंद ठेवा (Enable Popup on Website)
            </h4>
            <p className="text-xs text-brand-gray mt-0.5">
              सुरू केल्यावर नवीन भेट देणाऱ्या युजर्सना हा फोटो स्क्रीनवर दिसेल आणि बंद (Cancel / X) करण्याचे बटण असेल.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePopupActive}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              editableHomeContent?.popupAd?.enabled && editableHomeContent?.popupAd?.imageUrl
                ? 'bg-emerald-500'
                : 'bg-gray-300'
            }`}
            title={editableHomeContent?.popupAd?.enabled ? 'Click to disable' : 'Click to enable'}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                editableHomeContent?.popupAd?.enabled && editableHomeContent?.popupAd?.imageUrl
                  ? 'translate-x-7'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Image Upload and Live Preview */}
        <div className="space-y-3">
          <label className="block font-bold text-brand-plum text-xs uppercase tracking-wider">
            पॉप-अप जाहिरात फोटो (Popup Image Banner) *
          </label>

          {editableHomeContent?.popupAd?.imageUrl ? (
            <div className="p-4 rounded-2xl border-2 border-brand-rose/30 bg-gray-50 flex flex-col md:flex-row items-center gap-6">
              <div className="relative group max-w-xs w-full bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex items-center justify-center p-2">
                <img 
                  src={editableHomeContent.popupAd.imageUrl} 
                  alt="Popup Preview" 
                  className="w-full max-h-56 object-contain block rounded-xl bg-gray-50"
                />
                <div className="absolute top-3 right-3 flex space-x-1">
                  <span className="px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-semibold">
                    Current Image
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-1">
                  <p className="font-bold text-sm text-brand-charcoal">
                    फोटो यशस्वीरित्या अपलोड झाला आहे
                  </p>
                  <p className="text-xs text-brand-gray">
                    हा फोटो हाय-स्पीड लोडिंगसाठी कॉम्प्रेस केलेला आहे. युजरने साइट उघडल्यावर हा फोटो दिसेल.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="cursor-pointer px-4 py-2 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingPopupImage ? 'अपलोड होत आहे...' : 'दुसरा फोटो बदला (Change Image)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePopupImageUpload}
                      disabled={isUploadingPopupImage}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemovePopupImage}
                    className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>फोटो काढा (Remove Image)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPopupPreview(true)}
                    className="px-4 py-2 border border-brand-rose/30 bg-white hover:bg-brand-lightBg text-brand-plum font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>स्क्रीनवर कसा दिसेल ते पाहा (Preview Modal)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-brand-rose/40 rounded-2xl p-8 bg-brand-lightBg/50 text-center hover:bg-brand-rose/5 transition-colors">
              <input
                type="file"
                id="popup-image-upload-input"
                accept="image/*"
                onChange={handlePopupImageUpload}
                disabled={isUploadingPopupImage}
                className="hidden"
              />
              <label 
                htmlFor="popup-image-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                {isUploadingPopupImage ? (
                  <>
                    <Loader2 className="w-10 h-10 text-brand-plum animate-spin" />
                    <p className="font-bold text-brand-plum text-sm">फोटो अपलोड व ऑप्टिमाइझ होत आहे...</p>
                    <p className="text-xs text-brand-gray">कृपया थांबा...</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-brand-plum/10 text-brand-plum flex items-center justify-center shadow-inner">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-plum text-sm">
                        येथे क्लिक करून पॉप-अप जाहिरातीचा फोटो निवडा (Upload Image)
                      </p>
                      <p className="text-xs text-brand-gray mt-1">
                        Supports JPG, PNG, WEBP (जास्तीत जास्त 10MB) • आपोआप ऑप्टिमाइझ केला जाईल
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-plumDark transition-all">
                      फोटो निवडा (Browse Image)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* 3. Optional Settings: Title, Target Link URL, Button Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block font-semibold mb-1 text-brand-charcoal">
              पॉप-अप शीर्षक / टायटल (Optional Title)
            </label>
            <input
              type="text"
              placeholder="उदा. विशेष सवलत / दिवाळी ऑफर / नवीन मेळावा २०२६"
              value={editableHomeContent?.popupAd?.title || ''}
              onChange={(e) => setEditableHomeContent(prev => ({
                ...prev,
                popupAd: { ...(prev.popupAd || {}), title: e.target.value }
              }))}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-xs focus:ring-2 focus:ring-brand-plum focus:outline-none"
            />
            <span className="text-[10px] text-brand-gray">हे शीर्षक पॉप-अपच्या वर पट्टीमध्ये दिसेल (ऐच्छिक).</span>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-brand-charcoal">
              क्लिक केल्यावर जाणारी लिंक (Target Redirect Link - Optional)
            </label>
            <input
              type="text"
              placeholder="उदा. /signup किंवा /plans किंवा https://wa.me/919823425404"
              value={editableHomeContent?.popupAd?.linkUrl || ''}
              onChange={(e) => setEditableHomeContent(prev => ({
                ...prev,
                popupAd: { ...(prev.popupAd || {}), linkUrl: e.target.value }
              }))}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-xs focus:ring-2 focus:ring-brand-plum focus:outline-none"
            />
            <span className="text-[10px] text-brand-gray">युझरने फोटोवर किंवा बटणावर क्लिक केल्यास या लिंकवर नेले जाईल.</span>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-brand-charcoal">
              उपकल्पना / सबटायटल (Optional Subtitle)
            </label>
            <input
              type="text"
              placeholder="उदा. मर्यादित कालावधीसाठी मोफत नोंदणी"
              value={editableHomeContent?.popupAd?.subtitle || ''}
              onChange={(e) => setEditableHomeContent(prev => ({
                ...prev,
                popupAd: { ...(prev.popupAd || {}), subtitle: e.target.value }
              }))}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-xs focus:ring-2 focus:ring-brand-plum focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-brand-charcoal">
              अॅक्शन बटणाचे नाव (Button Label)
            </label>
            <input
              type="text"
              placeholder="उदा. अधिक माहिती (View Details)"
              value={editableHomeContent?.popupAd?.buttonText || ''}
              onChange={(e) => setEditableHomeContent(prev => ({
                ...prev,
                popupAd: { ...(prev.popupAd || {}), buttonText: e.target.value }
              }))}
              className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-xs focus:ring-2 focus:ring-brand-plum focus:outline-none"
            />
          </div>
        </div>

        {/* Save and Preview actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-brand-gray text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>पॉप-अपमध्ये युजरसाठी उजव्या कोपऱ्यात 'X' आणि खाली 'Cancel / बंद करा' बटण दिलेले आहे.</span>
          </div>

          <div className="flex items-center space-x-3">
            {editableHomeContent?.popupAd?.imageUrl && (
              <button
                type="button"
                onClick={() => setShowPopupPreview(true)}
                className="px-5 py-2.5 rounded-xl border border-brand-rose/40 bg-white text-brand-plum hover:bg-brand-lightBg font-bold text-xs transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>थेट टेस्ट करा (Preview Popup)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSavePopupSettingsOnly}
              className="px-6 py-2.5 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>पॉप-अप सेव्ह करा (Save Popup)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  // Helper to extract clean numeric age from profile
  const getAgeNum = (p) => {
    if (!p) return null;
    if (p.age !== undefined && p.age !== null && p.age !== '') {
      const digits = String(p.age).replace(/[^0-9]/g, '');
      if (digits) {
        const val = parseInt(digits, 10);
        if (!isNaN(val) && val > 0 && val < 120) return val;
      }
    }
    if (p.dob) {
      const yr = new Date(p.dob).getFullYear();
      if (!isNaN(yr) && yr > 1900) return new Date().getFullYear() - yr;
    }
    return null;
  };

  // Helper to extract clean numeric ID from profile
  const getIdNum = (p) => {
    if (!p) return 0;
    const num = parseInt(String(p.registrationId || p.regId || p.id || '').replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Dynamic list of unique castes (normalized & deduplicated case-insensitively)
  const allCastesList = (() => {
    const rawCastes = [
      ...MAHARASHTRA_COMMUNITIES,
      ...profiles.map((p) => p.caste).filter(Boolean)
    ];

    const map = new Map();
    rawCastes.forEach((c) => {
      if (typeof c === 'string') {
        let trimmed = c.trim();
        if (/bauddha/i.test(trimmed)) {
          trimmed = trimmed.replace(/bauddha/gi, 'Buddhist');
        }
        if (trimmed && trimmed.toLowerCase() !== 'other') {
          const key = trimmed.toLowerCase();
          if (!map.has(key)) {
            map.set(key, trimmed);
          }
        }
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  })();

  // Filtered profiles for Export Tab
  const filteredExportProfiles = profiles.filter((p) => {
    // Exclude Admin accounts
    if (p.isAdmin || p.role === 'admin' || p.id === 'admin_1') return false;

    // 1. Caste Filter (Supports dropdown + search query)
    if (exportCasteFilter !== 'all') {
      const pCaste = (p.caste || '').toLowerCase().trim();
      const fCaste = exportCasteFilter.toLowerCase().trim();
      const isMatch = pCaste === fCaste || pCaste.includes(fCaste) || fCaste.includes(pCaste);
      if (!isMatch) return false;
    }
    if (exportCasteQuery && exportCasteQuery.trim() !== '') {
      const pCaste = (p.caste || '').toLowerCase().trim();
      const qCaste = exportCasteQuery.toLowerCase().trim();
      if (!pCaste.includes(qCaste)) return false;
    }

    // 2. Gender Filter (Supports female, male, f, m, girl, boy)
    if (exportGenderFilter !== 'all') {
      const g = (p.gender || '').toLowerCase().trim();
      const targetG = exportGenderFilter.toLowerCase().trim();
      if (targetG === 'female') {
        const isFemale = g === 'female' || g === 'f' || g === 'girl' || g === 'woman';
        if (!isFemale) return false;
      } else if (targetG === 'male') {
        const isMale = g === 'male' || g === 'm' || g === 'boy' || g === 'man';
        if (!isMale) return false;
      } else {
        if (g !== targetG) return false;
      }
    }

    // 3. Age Filter (Strictly between exportMinAge and exportMaxAge 18-60)
    const ageVal = getAgeNum(p);
    if (ageVal !== null) {
      if (ageVal < Number(exportMinAge) || ageVal > Number(exportMaxAge)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (exportSortBy === 'age_asc') {
      return (getAgeNum(a) || 0) - (getAgeNum(b) || 0);
    }
    if (exportSortBy === 'age_desc') {
      return (getAgeNum(b) || 0) - (getAgeNum(a) || 0);
    }
    if (exportSortBy === 'name_asc') {
      return String(a.name || '').localeCompare(String(b.name || ''));
    }
    return getIdNum(a) - getIdNum(b);
  });

  // Export to Excel handler (.xlsx / .csv)
  const handleExportToExcel = () => {
    if (!filteredExportProfiles || filteredExportProfiles.length === 0) {
      alert('No profiles match the selected filters to export.');
      return;
    }

    const headers = ['ID', 'Gender', 'Name', 'City', 'Education', 'Job', 'Age', 'Contact Number'];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredExportProfiles.map((p) => {
      const rawId = String(p.registrationId || p.regId || p.id || '');
      const formattedId = rawId.replace(/^SS-?/i, '');

      const genderRaw = p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()) : 'N/A';
      const formattedName = p.name || 'N/A';
      const formattedCity = p.city || p.district || p.nativePlace || p.location || p.address || 'N/A';
      const formattedEducation = p.education || p.degree || p.qualification || 'N/A';
      const formattedJob = p.occupation || p.job || p.designation || p.company || 'N/A';
      const parsedAge = getAgeNum(p);
      const formattedAge = parsedAge !== null ? String(parsedAge) : (p.age ? String(p.age) : 'N/A');
      const formattedContact = p.phone || p.contactNumber || p.mobile || p.contact || 'N/A';

      return [
        escapeCSV(formattedId),
        escapeCSV(genderRaw),
        escapeCSV(formattedName),
        escapeCSV(formattedCity),
        escapeCSV(formattedEducation),
        escapeCSV(formattedJob),
        escapeCSV(formattedAge),
        escapeCSV(formattedContact)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `Sambodhi_Sarang_Profiles_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (addToast) {
      addToast(`Exported ${filteredExportProfiles.length} profiles to Excel sheet (${fileName})`, 'success');
    }
  };

  // Export to PDF handler (.pdf)
  const handleExportToPdf = () => {
    if (!filteredExportProfiles || filteredExportProfiles.length === 0) {
      alert('No profiles match the selected filters to export.');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      const totalProfiles = filteredExportProfiles.length;
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      // Top Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(74, 21, 56); // #4a1538 Brand Plum
      doc.text('Sambodhi Sarang Marriage Bureau (Ichalkaranji)', 40, 36);

      // Subtitle & Filter summary
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`Official Member Directory Export  |  Date: ${dateStr}  |  Total Records: ${totalProfiles} Profiles`, 40, 52);

      const filterDesc = `Filters: Gender: ${exportGenderFilter.toUpperCase()} | Caste: ${exportCasteFilter === 'custom' ? (exportCasteQuery || 'Custom') : exportCasteFilter.toUpperCase()} | Age Range: ${exportMinAge} - ${exportMaxAge} yrs`;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(filterDesc, 40, 64);

      // Table Header and Rows
      const head = [['ID', 'Gender', 'Full Name', 'District / City', 'Education', 'Occupation', 'Age', 'Contact Number']];

      const rows = filteredExportProfiles.map((p) => {
        const rawId = String(p.registrationId || p.regId || p.id || '');
        const formattedId = rawId.replace(/^SS-?/i, '');
        const genderRaw = p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()) : 'N/A';
        const formattedName = p.name || p.nameMr || 'N/A';
        const formattedCity = p.city || p.district || p.nativePlace || p.location || p.address || 'N/A';
        const formattedEducation = p.education || p.degree || p.qualification || 'N/A';
        const formattedJob = p.occupation || p.job || p.designation || p.company || 'N/A';
        const parsedAge = getAgeNum(p);
        const formattedAge = parsedAge !== null ? String(parsedAge) : (p.age ? String(p.age) : 'N/A');
        const formattedContact = p.phone || p.contactNumber || p.mobile || p.contact || 'N/A';

        return [
          `SS-${formattedId}`,
          genderRaw,
          formattedName,
          formattedCity,
          formattedEducation,
          formattedJob,
          formattedAge,
          formattedContact
        ];
      });

      autoTable(doc, {
        head: head,
        body: rows,
        startY: 74,
        margin: { top: 74, left: 40, right: 40, bottom: 30 },
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [74, 21, 56], // Brand Plum
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        alternateRowStyles: {
          fillColor: [252, 247, 249]
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 50 },
          2: { cellWidth: 120 },
          3: { cellWidth: 100 },
          4: { cellWidth: 110 },
          5: { cellWidth: 110 },
          6: { cellWidth: 35, halign: 'center' },
          7: { cellWidth: 95 }
        },
        didDrawPage: (data) => {
          const totalPages = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          const pageWidth = pageSize.width || pageSize.getWidth();

          doc.setFontSize(8);
          doc.setTextColor(140, 140, 140);
          doc.text(`Page ${data.pageNumber} of ${totalPages}`, data.settings.margin.left, pageHeight - 12);
          doc.text('Sambodhi Sarang Matrimony (Ichalkaranji) - Confidential Admin Export', pageWidth - 260, pageHeight - 12);
        }
      });

      const fileName = `Sambodhi_Sarang_Profiles_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      if (addToast) {
        addToast(`Exported ${filteredExportProfiles.length} profiles to PDF (${fileName})`, 'success');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Administrator Authorization Gate: Prevent unauthorized users from accessing admin functions or private reports
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-brand-rose/20 shadow-luxury space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-brand-plum">
              Administrator Access Required
            </h2>
            <p className="text-xs text-brand-gray leading-relaxed">
              This area is restricted to authorized Sambodhi Sarang administrators only. Member safety reports and administrative tools are confidential.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-xs hover:bg-brand-plumDark transition-all"
            >
              Go to Login Page
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-all"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          onClick={() => setActiveTab('popup')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 relative ${
            activeTab === 'popup'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Popup Ad (पॉप-अप जाहिरात)</span>
          {editableHomeContent?.popupAd?.enabled && editableHomeContent?.popupAd?.imageUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          )}
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

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'plans'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Plan Rates & Pricing (दर व्यवस्थापन)</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'export'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>Profile Export & Filters (एक्सपोर्ट डेटा)</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 relative ${
            activeTab === 'moderation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Reports & Moderation (तक्रार निवारण)</span>
          {pendingReportsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('deletions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 relative ${
            activeTab === 'deletions'
              ? 'bg-rose-700 text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Deletion Requests (खाते हटवा विनंत्या)</span>
          {pendingDeletionsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
              {pendingDeletionsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            
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

            <div 
              onClick={() => {
                setActiveTab('moderation');
                setReportStatusFilter('pending');
              }}
              className="bg-white p-6 rounded-3xl border border-rose-200 shadow-luxury space-y-2 cursor-pointer hover:border-rose-400 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase">User Reports</span>
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-rose-600">{reports.length}</p>
              <p className="text-[11px] text-gray-500">
                <strong className="text-rose-600 font-bold">{pendingReportsCount}</strong> pending review
              </p>
            </div>

          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            <h3 className="font-serif font-bold text-lg text-brand-plum">Quick Bureau Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span>Verify / Manage Profiles</span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className="p-4 bg-brand-lightBg hover:bg-brand-plum hover:text-white rounded-2xl border border-brand-rose/20 transition-all font-bold text-xs flex items-center justify-center space-x-2 text-brand-plum"
              >
                <Layout className="w-4 h-4" />
                <span>Edit Homepage Headlines</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('moderation');
                  setReportStatusFilter('pending');
                }}
                className="p-4 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-200 transition-all font-bold text-xs flex items-center justify-center space-x-2 text-rose-700"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Review Reports ({pendingReportsCount})</span>
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
              <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOptimizeAllPhotos}
                  disabled={isOptimizingPhotos}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-60"
                  title="Scan & compress all existing profile photos in database to ~100KB for lightning-fast loading"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isOptimizingPhotos ? (optimizingProgress ? `Compressing (${optimizingProgress})` : 'Compressing...') : '⚡ Compress All Photos'}</span>
                </button>
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
                  {DISTRICTS.map((d) => (
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
                          <div className="relative rounded-full overflow-hidden w-10 h-10 shrink-0">
                            <img
                              src={p.avatar || (Array.isArray(p.photos) && p.photos[0]) || '/default-avatar.png'}
                              alt={p.name}
                              className="w-10 h-10 rounded-full object-cover border border-brand-rose/30"
                            />
                            <WatermarkOverlay size="small" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-brand-plum">{p.name}</p>
                              {p.blocked && (
                                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded">
                                  BLOCKED
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-brand-kesari">Profile No. {p.registrationId || (p.regId ? String(p.regId).replace(/^SS-?/i, '') : '1001')}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="capitalize font-semibold">{p.gender}</span> • {p.age} yrs
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-brand-charcoal">{p.district}</p>
                        <p className="text-[10px] text-brand-gray">{p.caste ? String(p.caste).replace(/bauddha/gi, 'Buddhist') : ''}</p>
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
                            onClick={() => handleOpenResetPassword(p)}
                            className="p-2 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-xl transition-all border border-amber-300"
                            title="Reset Account Password (पासवर्ड रिसेट करा)"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-700" />
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

      {/* TAB: POPUP ANNOUNCEMENT AD */}
      {activeTab === 'popup' && (
        <div className="space-y-8 animate-fade-in">
          {renderPopupAdManagerCard()}
        </div>
      )}

      {/* TAB 3: MANAGE HOMEPAGE CONTENT */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Section: Popup Announcement Ad Manager */}
          {renderPopupAdManagerCard()}

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

      {/* TAB 6: SUBSCRIPTION PLANS & PRICING MANAGEMENT */}
      {activeTab === 'plans' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="bg-gradient-to-r from-amber-500/10 via-brand-plum/10 to-amber-500/10 border border-amber-300 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-amber-600 fill-amber-500" />
                <h2 className="font-serif text-2xl font-bold text-brand-plum">
                  Subscription Plan Rates & Pricing (सभासदत्व प्लॅन दर व्यवस्थापन)
                </h2>
              </div>
              <p className="text-xs text-brand-gray">
                Update membership plan prices (₹ amounts), contact view credits limit, and plan titles. Changes reflect live on Razorpay checkout & candidate subscription modal.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={handleResetSubscriptionPlans}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-charcoal font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 border border-gray-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveSubscriptionPlans} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editablePlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-3xl border-2 p-6 space-y-5 shadow-luxury relative overflow-hidden transition-all ${
                    plan.popular ? 'border-amber-400 ring-2 ring-amber-300/50' : 'border-brand-rose/20'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-bl-2xl shadow-sm uppercase tracking-wider">
                      Most Popular Plan
                    </div>
                  )}

                  <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold bg-gradient-to-r ${plan.headerBg}`}>
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-brand-plum">{plan.name} Plan</h3>
                      <p className="text-xs text-brand-gray font-medium">{plan.nameMar}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-plum mb-1">
                        Plan Price / दर (in ₹ INR) <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-sm font-bold text-brand-gray">₹</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={plan.price}
                          onChange={(e) => handlePlanPriceChange(plan.id, 'price', e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-extrabold text-base text-brand-plum focus:ring-2 focus:ring-brand-plum focus:bg-white transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Amount charged on Razorpay payment gateway</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-plum mb-1">
                        Profile Visit Credits Limit (Contact Numbers Unlocked) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={plan.visits}
                        onChange={(e) => handlePlanPriceChange(plan.id, 'visits', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl font-bold text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-plum focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-plum mb-1">
                        Plan Validity Period
                      </label>
                      <input
                        type="text"
                        value={plan.validity || ''}
                        onChange={(e) => handlePlanPriceChange(plan.id, 'validity', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum focus:bg-white transition-all"
                        placeholder="e.g. 1 Year"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-plum mb-1">
                        Marathi Title (मराठी नाव)
                      </label>
                      <input
                        type="text"
                        value={plan.nameMar || ''}
                        onChange={(e) => handlePlanPriceChange(plan.id, 'nameMar', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-brand-charcoal focus:ring-2 focus:ring-brand-plum focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Current Rate:</span>
                    <span className="font-extrabold text-brand-plum text-sm">₹ {plan.price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-brand-plum to-rose-600 hover:from-brand-plumDark hover:to-rose-700 text-white font-bold text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center space-x-2 border border-white/20"
              >
                <Save className="w-4 h-4 text-brand-gold" />
                <span>Save All Subscription Plan Rates (दर अद्ययावत करा)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: PROFILE FILTER & EXCEL EXPORT */}
      {activeTab === 'export' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Header Banner Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Admin Data Export Utility</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Profile Filter, Excel & PDF Export (माहिती एक्सपोर्ट करा)
              </h2>
              <p className="text-xs text-emerald-100 max-w-2xl">
                Filter registered profiles by Caste, Gender, and Age range (18 to 60). Export the filtered dataset directly into Microsoft Excel (.csv) or formatted PDF document (.pdf).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleExportToExcel}
                disabled={filteredExportProfiles.length === 0}
                className={`px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg border transition-all ${
                  filteredExportProfiles.length > 0
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400/40 hover:scale-105 cursor-pointer'
                    : 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed'
                }`}
                title="Download filtered profiles as Microsoft Excel sheet (.csv)"
              >
                <Download className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Download Excel Sheet ({filteredExportProfiles.length})</span>
              </button>

              <button
                type="button"
                onClick={handleExportToPdf}
                disabled={filteredExportProfiles.length === 0}
                className={`px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg border transition-all ${
                  filteredExportProfiles.length > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400/40 hover:scale-105 cursor-pointer'
                    : 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed'
                }`}
                title="Download filtered profiles as formatted PDF document (.pdf)"
              >
                <FileText className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Download PDF Document ({filteredExportProfiles.length})</span>
              </button>
            </div>
          </div>

          {/* Filter Controls Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-brand-plum" />
                <h3 className="font-serif font-bold text-lg text-brand-plum">Filter Profiles (फिल्टर निवडा)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExportCasteFilter('all');
                  setExportCasteQuery('');
                  setExportGenderFilter('all');
                  setExportMinAge(18);
                  setExportMaxAge(60);
                  setExportSortBy('id_asc');
                }}
                className="text-xs font-semibold text-brand-plum hover:underline"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
              {/* Gender Filter */}
              <div>
                <label className="block font-bold text-brand-charcoal mb-1.5">
                  Gender (लिंग)
                </label>
                <select
                  value={exportGenderFilter}
                  onChange={(e) => setExportGenderFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 bg-gray-50"
                >
                  <option value="all">All Genders (सर्व)</option>
                  <option value="female">Female (स्त्री)</option>
                  <option value="male">Male (पुरुष)</option>
                </select>
              </div>

              {/* Caste Filter & Search */}
              <div className="space-y-1.5">
                <label className="block font-bold text-brand-charcoal">
                  Caste / Community (जात)
                </label>
                <div className="space-y-1.5">
                  <select
                    value={exportCasteFilter}
                    onChange={(e) => setExportCasteFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 bg-gray-50"
                  >
                    <option value="all">All Castes (सर्व जाती)</option>
                    {allCastesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={exportCasteQuery}
                    onChange={(e) => setExportCasteQuery(e.target.value)}
                    placeholder="Search custom caste..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 bg-white"
                  />
                </div>
              </div>

              {/* Min Age Filter (18 to 60) */}
              <div>
                <label className="block font-bold text-brand-charcoal mb-1.5">
                  Min Age (किमान वय: {exportMinAge} yrs)
                </label>
                <select
                  value={exportMinAge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setExportMinAge(val);
                    if (val > exportMaxAge) setExportMaxAge(val);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 bg-gray-50"
                >
                  {Array.from({ length: 43 }, (_, i) => 18 + i).map((ageNum) => (
                    <option key={ageNum} value={ageNum}>
                      {ageNum} Years
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Age Filter (18 to 60) */}
              <div>
                <label className="block font-bold text-brand-charcoal mb-1.5">
                  Max Age (कमाल वय: {exportMaxAge} yrs)
                </label>
                <select
                  value={exportMaxAge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setExportMaxAge(val);
                    if (val < exportMinAge) setExportMinAge(val);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-semibold text-brand-charcoal focus:ring-2 focus:ring-brand-plum/20 bg-gray-50"
                >
                  {Array.from({ length: 43 }, (_, i) => 18 + i).map((ageNum) => (
                    <option key={ageNum} value={ageNum}>
                      {ageNum} Years
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
              <div className="text-xs text-brand-gray font-medium">
                Showing <span className="font-bold text-brand-plum text-sm">{filteredExportProfiles.length}</span> matching profiles (out of {profiles.length} total)
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <label className="text-xs font-bold text-brand-gray shrink-0">Sort By:</label>
                <select
                  value={exportSortBy}
                  onChange={(e) => setExportSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-charcoal bg-gray-50"
                >
                  <option value="id_asc">ID (Low to High)</option>
                  <option value="age_asc">Age (Youngest First)</option>
                  <option value="age_desc">Age (Oldest First)</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filtered Data Preview Table */}
          <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-lightBg/30">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-brand-plum">
                  Filtered Data Preview (डेटा पूर्वावलोकन)
                </h3>
                <p className="text-[11px] text-brand-gray">
                  Data to be exported: ID, Gender, Name, City, Education, Job, Age, Contact Number
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportToExcel}
                  disabled={filteredExportProfiles.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
                  title="Download Excel Sheet (.csv)"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportToPdf}
                  disabled={filteredExportProfiles.length === 0}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
                  title="Download PDF Document (.pdf)"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-plum text-white font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Gender</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Education</th>
                    <th className="p-3.5">Job</th>
                    <th className="p-3.5">Age</th>
                    <th className="p-3.5">Contact Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-brand-charcoal">
                  {filteredExportProfiles.map((p) => {
                    const rawId = String(p.registrationId || p.regId || p.id || '');
                    const formattedId = rawId.replace(/^SS-?/i, '');
                    const formattedGender = p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()) : 'N/A';
                    const formattedCity = p.city || p.district || p.nativePlace || p.location || p.address || 'N/A';
                    const formattedEducation = p.education || p.degree || p.qualification || 'N/A';
                    const formattedJob = p.occupation || p.job || p.designation || p.company || 'N/A';
                    const parsedAge = getAgeNum(p);
                    const formattedAge = parsedAge !== null ? String(parsedAge) : (p.age ? String(p.age) : 'N/A');
                    const formattedContact = p.phone || p.contactNumber || p.mobile || p.contact || 'N/A';

                    return (
                      <tr key={p.id} className="hover:bg-brand-lightBg/40 transition-colors">
                        <td className="p-3.5 font-bold text-brand-plum">{formattedId}</td>
                        <td className="p-3.5 font-medium capitalize">{formattedGender}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.name || 'N/A'}</td>
                        <td className="p-3.5 font-medium text-gray-700">{formattedCity}</td>
                        <td className="p-3.5 font-medium text-gray-700">{formattedEducation}</td>
                        <td className="p-3.5 font-medium text-gray-700">{formattedJob}</td>
                        <td className="p-3.5 font-bold text-slate-800">{formattedAge !== 'N/A' ? `${formattedAge} yrs` : 'N/A'}</td>
                        <td className="p-3.5 font-bold text-emerald-700">{formattedContact}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredExportProfiles.length === 0 && (
              <div className="p-12 text-center text-xs text-brand-gray space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-semibold text-brand-plum">No profiles match the selected Caste, Gender, and Age filters.</p>
                <p className="text-[11px] text-gray-400">Try adjusting your filter settings above to view and export data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS & MODERATION (तक्रार निवारण व सुरक्षितता) */}
      {activeTab === 'moderation' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Header Banner Card */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-brand-plum text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-400/30">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Bureau User Safety & Content Moderation</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Reports & Content Moderation (तक्रार निवारण)
              </h2>
              <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
                Review member complaints regarding inappropriate profiles, photos, or private messages. Inspect evidence, issue warnings, remove violating content, suspend offending accounts, and record administrative decisions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {pendingChildSafetyCount > 0 && (
                <div className="px-4 py-2.5 bg-red-500/30 rounded-2xl border border-red-400/50 text-center animate-pulse">
                  <div className="text-[10px] uppercase font-bold text-red-200">🚨 Child Safety</div>
                  <div className="text-xl font-extrabold text-white">{pendingChildSafetyCount}</div>
                </div>
              )}
              <div className="px-4 py-2.5 bg-white/10 rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-200">Pending Review</div>
                <div className="text-xl font-extrabold text-amber-300">{pendingReportsCount}</div>
              </div>
              <div className="px-4 py-2.5 bg-white/10 rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-200">Total Reports</div>
                <div className="text-xl font-extrabold text-white">{reports.length}</div>
              </div>
              <div className="px-4 py-2.5 bg-white/10 rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-200">Suspended Accounts</div>
                <div className="text-xl font-extrabold text-rose-300">{suspendedProfilesCount}</div>
              </div>
            </div>
          </div>

          {/* Urgent Child Safety Alert Banner */}
          {pendingChildSafetyCount > 0 && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-rose-800 to-red-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-red-400">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="p-2.5 bg-white/20 rounded-2xl text-2xl animate-pulse shrink-0">
                  🚨
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-red-300">
                      High Priority • Zero Tolerance
                    </span>
                    <span className="text-xs text-red-200">Action Required</span>
                  </div>
                  <h4 className="font-serif font-bold text-base sm:text-lg mt-0.5">
                    {pendingChildSafetyCount} Urgent Child Safety Incident {pendingChildSafetyCount === 1 ? 'Report' : 'Reports'} Pending
                  </h4>
                  <p className="text-xs text-red-100 max-w-2xl mt-0.5 leading-relaxed">
                    Mandatory immediate review under Sambodhi Sarang Child Safety Standards. Review evidence, remove illicit media, suspend account, preserve audit logs, and escalate to law enforcement (cybercrime.gov.in / Helpline 1930) if applicable.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReportStatusFilter('pending');
                  setReportTypeFilter('child_safety');
                }}
                className="px-4 py-2.5 bg-white text-red-800 hover:bg-red-50 font-bold text-xs rounded-xl shadow-md shrink-0 transition-all hover:scale-105"
              >
                Inspect Urgent Reports ({pendingChildSafetyCount})
              </button>
            </div>
          )}

          {/* Controls: Status tabs, type filter, search query */}
          <div className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Status Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setReportStatusFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                    reportStatusFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>Pending</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    reportStatusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pendingReportsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportStatusFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                    reportStatusFilter === 'all'
                      ? 'bg-brand-plum text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>All Reports</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    reportStatusFilter === 'all' ? 'bg-brand-plumDark text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {reports.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportStatusFilter('resolved')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                    reportStatusFilter === 'resolved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>Resolved</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    reportStatusFilter === 'resolved' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {resolvedReportsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportStatusFilter('dismissed')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                    reportStatusFilter === 'dismissed'
                      ? 'bg-gray-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>Dismissed</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    reportStatusFilter === 'dismissed' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {dismissedReportsCount}
                  </span>
                </button>
              </div>

              {/* Type Filter & Search Input */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-brand-plum focus:bg-white"
                >
                  <option value="all">All Content Types</option>
                  <option value="child_safety">🚨 Child Safety / Critical</option>
                  <option value="profile">Profiles only</option>
                  <option value="photo">Photos only</option>
                  <option value="message">Messages only</option>
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={reportSearchQuery}
                    onChange={(e) => setReportSearchQuery(e.target.value)}
                    placeholder="Search member, ID, or keywords..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-brand-plum focus:bg-white"
                  />
                  {reportSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setReportSearchQuery('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reports Listing */}
          <div className="space-y-4">
            {filteredAndSortedReports.map((report) => {
              const targetProfile = profiles.find((p) => {
                const tId = String(report.targetId || report.targetUserId || '').trim().toLowerCase();
                const tReg = String(report.targetRegId || '').trim().toLowerCase().replace(/^ss-?/i, '');
                const tName = String(report.targetName || '').trim().toLowerCase();

                if (tId && (
                  String(p.id).toLowerCase() === tId || 
                  String(p.regId || '').toLowerCase() === tId || 
                  String(p.registrationId || '').toLowerCase() === tId ||
                  String(p.id || '').toLowerCase().replace(/^ss-?/i, '') === tId.replace(/^ss-?/i, '')
                )) {
                  return true;
                }
                if (tReg && (
                  String(p.regId || '').toLowerCase().replace(/^ss-?/i, '') === tReg || 
                  String(p.registrationId || '').toLowerCase() === tReg
                )) {
                  return true;
                }
                if (tName && tName !== 'member' && String(p.name || '').trim().toLowerCase() === tName) {
                  return true;
                }
                return false;
              });

              const resolvedTargetId = targetProfile?.id || report.targetId || report.targetUserId || (targetProfile?.regId ? targetProfile.regId : '');
              const resolvedTargetName = targetProfile?.name || report.targetName || 'Member';
              const isTargetSuspended = Boolean(targetProfile?.blocked);
              const isTargetVerified = Boolean(targetProfile?.verified);
              const isPending = report.status === 'pending';
              const isResolved = report.status === 'resolved';
              const isChildSafety = Boolean(report.isChildSafety || report.priority === 'critical');

              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 shadow-sm hover:shadow-md ${
                    isChildSafety && isPending
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20'
                      : isPending
                      ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20'
                      : isResolved
                      ? 'border-emerald-200'
                      : 'border-gray-200 opacity-85'
                  }`}
                >
                  {/* Top Bar: Badges + Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {isChildSafety && (
                        <span className="px-2.5 py-1 bg-red-600 text-white rounded-full text-[11px] font-black tracking-wide flex items-center space-x-1 border border-red-700 shadow-xs animate-pulse">
                          <span>🚨</span>
                          <span>CHILD SAFETY / CRITICAL</span>
                        </span>
                      )}

                      {isPending && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-extrabold flex items-center space-x-1.5 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {isResolved && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold flex items-center space-x-1.5 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </span>
                      )}
                      {report.status === 'dismissed' && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-bold flex items-center space-x-1.5 border border-gray-300">
                          <XCircle className="w-3 h-3 text-gray-500" />
                          <span>Dismissed</span>
                        </span>
                      )}

                      {/* Content Type Badge */}
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold flex items-center space-x-1">
                        {report.targetType === 'profile' && <User className="w-3 h-3 text-brand-plum" />}
                        {report.targetType === 'photo' && <ImageIcon className="w-3 h-3 text-brand-kesari" />}
                        {report.targetType === 'message' && <MessageSquare className="w-3 h-3 text-blue-600" />}
                        <span className="capitalize">{report.targetType} Report</span>
                      </span>

                      {/* Report Reason Pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isChildSafety 
                          ? 'bg-red-100 text-red-800 border-red-300' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {report.reason}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 font-mono">
                      Report #{String(report.id).slice(-8)} • {report.createdAt ? new Date(report.createdAt).toLocaleString('en-IN') : 'Recent'}
                    </div>
                  </div>

                  {/* Two-Column Info: Reporter vs Reported Account */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    
                    {/* Column 1: Reporter */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                        <span>Reported By (तक्रारदार)</span>
                      </div>
                      <div className="font-bold text-slate-800 text-sm">
                        {report.reporterName || 'Registered Member'}
                      </div>
                      <div className="text-gray-600 text-[11px] space-y-0.5">
                        <p>User ID: <span className="font-mono text-slate-700">{report.reporterId}</span></p>
                        {report.reporterPhone && <p>Phone: <span className="font-semibold text-slate-700">{report.reporterPhone}</span></p>}
                        {report.reporterEmail && <p>Email: <span className="text-slate-700">{report.reporterEmail}</span></p>}
                      </div>
                    </div>

                    {/* Column 2: Reported Member */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold uppercase text-rose-600 tracking-wider flex items-center space-x-1">
                        <span>Offending Member (तक्रार असलेला सभासद)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-plum text-sm">
                          {resolvedTargetName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (resolvedTargetId) {
                              onNavigate(`/profile/${resolvedTargetId}`);
                            } else {
                              addToast('Candidate profile could not be located.', 'error');
                            }
                          }}
                          className="text-[11px] font-bold text-brand-plum hover:underline inline-flex items-center space-x-1"
                          title="Open Full Candidate Profile"
                        >
                          <span>View Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="font-mono text-[11px] text-gray-500">
                          ID: {resolvedTargetId || 'N/A'}
                          {targetProfile?.registrationId ? ` (SS-${targetProfile.registrationId})` : ''}
                        </span>
                        
                        {/* Integrated Manual Profile Verification Badge */}
                        <button
                          type="button"
                          onClick={() => {
                            if (resolvedTargetId) {
                              toggleVerifyProfile(resolvedTargetId);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors ${
                            isTargetVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                          title="Click to toggle profile verification approval"
                        >
                          {isTargetVerified ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified ✓ (Click to Revoke)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-amber-600" />
                              <span>Unverified (Click to Approve)</span>
                            </>
                          )}
                        </button>

                        {/* Current Account Block/Suspension Status */}
                        {isTargetSuspended ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1">
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>Account Suspended</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Account Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reporter's Optional Explanation Details */}
                  {report.details && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-950">
                      <span className="font-bold text-[11px] text-amber-800 block mb-0.5">Member Explanation / तक्रारीचा तपशील:</span>
                      <p className="italic leading-relaxed whitespace-pre-wrap">"{report.details}"</p>
                    </div>
                  )}

                  {/* Statutory Child Safety Enforcement Protocol Callout */}
                  {isChildSafety && (
                    <div className="p-3.5 bg-red-50/90 border border-red-300 rounded-2xl text-xs text-red-950 space-y-1.5 shadow-2xs">
                      <div className="flex items-center space-x-1.5 text-red-800 font-bold text-[11px]">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Statutory Child Safety Enforcement Protocol (POCSO & IT Act)</span>
                      </div>
                      <p className="text-[11px] text-red-900 leading-relaxed">
                        Sambodhi Sarang operates a strict zero-tolerance policy against CSAE/CSAM, predatory solicitation, and underage participation. If violation is confirmed: 
                        1) Click <strong>Suspend Account</strong> immediately. 
                        2) Click <strong>Remove Content</strong> to purge illicit media. 
                        3) Preserve user profile ID, phone number, and transmission logs. 
                        4) Escalate immediately to the National Cyber Crime Reporting Portal (<a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-800 hover:text-red-950">cybercrime.gov.in</a>) or dial helpline <strong>1930</strong>.
                      </p>
                    </div>
                  )}

                  {/* Evidence Box */}
                  {report.targetType === 'photo' && report.evidencePhotoUrl && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-brand-kesari" />
                          <span>Reported Photo Evidence (तक्रार केलेला फोटो)</span>
                        </span>
                        <a
                          href={report.evidencePhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-plum hover:underline inline-flex items-center space-x-1 text-[11px]"
                        >
                          <span>Open full size</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center space-x-4">
                        <img
                          src={report.evidencePhotoUrl}
                          alt="Reported evidence"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-300 shadow-xs"
                        />
                        <div className="space-y-2 text-xs">
                          <p className="text-gray-500 text-[11px]">
                            Check if this photo violates community modesty, identity, or copyright rules.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveContent(report)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Remove This Photo from Profile</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {report.targetType === 'message' && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>Reported Private Message Evidence (तक्रार केलेला मेसेज)</span>
                        </span>
                        {report.messageId && (
                          <span className="font-mono text-[10px] text-gray-400">Message #{report.messageId}</span>
                        )}
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-slate-800 shadow-2xs leading-relaxed font-sans">
                        "{report.evidenceText || 'No text content provided.'}"
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContent(report)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete Violating Message from Chat</span>
                      </button>
                    </div>
                  )}

                  {/* Administrative Resolution History (If resolved or dismissed) */}
                  {(isResolved || report.status === 'dismissed') && (
                    <div className={`p-3 rounded-xl text-xs space-y-1 border ${
                      report.status === 'dismissed'
                        ? 'bg-slate-100 border-slate-300 text-slate-800'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}>
                      <div className={`flex items-center justify-between font-bold text-[11px] ${
                        report.status === 'dismissed' ? 'text-slate-700' : 'text-emerald-800'
                      }`}>
                        <span>Administrative Decision ({report.status === 'dismissed' ? 'Dismissed' : (report.actionTaken || report.status)}):</span>
                        <span>{report.status === 'dismissed' ? 'Dismissed' : 'Resolved'} {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString('en-IN') : ''}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${
                        report.status === 'dismissed' ? 'text-slate-600' : 'text-emerald-900'
                      }`}>
                        {report.adminNotes || (report.status === 'dismissed' ? 'Report reviewed and dismissed by administration.' : 'Reviewed and closed by administration.')}
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                    
                    {/* Left Actions: Warn Member, Suspend Account */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenWarnModal(report)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs"
                        title="Send formal warning notification to this member"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Issue Official Warning</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSuspendAccount(resolvedTargetId, report)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs border ${
                          isTargetSuspended
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                        }`}
                        title="Suspend or activate this account"
                      >
                        {isTargetSuspended ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Unsuspend Account</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Suspend Account</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Right Actions: Mark as Resolved, Dismiss */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(report, 'dismiss')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                          report.status === 'dismissed'
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        title="Dismiss report as unfounded or non-violating"
                      >
                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                        <span>{report.status === 'dismissed' ? 'Dismissed ✓' : 'Dismiss'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(report, 'resolve')}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all ${
                          isResolved
                            ? 'bg-emerald-700 text-white'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
                        }`}
                        title="Mark this report as successfully resolved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isResolved ? 'Resolved ✓' : 'Mark as Resolved'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredAndSortedReports.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-base text-slate-800">No Reports Found</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {reportStatusFilter === 'pending'
                    ? 'No pending reports awaiting moderation! All user safety reports have been resolved.'
                    : 'No reports match your current filter settings.'}
                </p>
                {reportStatusFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setReportStatusFilter('all');
                      setReportTypeFilter('all');
                      setReportSearchQuery('');
                    }}
                    className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    View All Reports
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 8: ACCOUNT DELETION REQUESTS */}
      {activeTab === 'deletions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Google Play & Regulatory Compliance</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
                  Account & Data Deletion Requests
                </h3>
                <p className="text-xs sm:text-sm text-rose-200/80 max-w-2xl font-medium">
                  Review and process user requests to permanently purge profile biodata, photographs, and messages from Sambodhi Sarang Marriage Bureau.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href="/delete-account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5"
                >
                  <span>Public Deletion URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <div className="text-[11px] text-gray-300 font-medium">Total Requests</div>
                <div className="text-xl font-extrabold text-white">{deletionRequests.length}</div>
              </div>
              <div className="bg-rose-500/15 border border-rose-500/30 p-3.5 rounded-2xl">
                <div className="text-[11px] text-rose-300 font-bold">Pending Action</div>
                <div className="text-xl font-extrabold text-rose-400">{pendingDeletionsCount}</div>
              </div>
              <div className="bg-emerald-500/15 border border-emerald-500/30 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                <div className="text-[11px] text-emerald-300 font-bold">Completed & Purged</div>
                <div className="text-xl font-extrabold text-emerald-400">{completedDeletionsCount}</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeletionStatusFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    deletionStatusFilter === 'pending'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Pending</span>
                  {pendingDeletionsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-extrabold">
                      {pendingDeletionsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeletionStatusFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    deletionStatusFilter === 'all'
                      ? 'bg-brand-plum text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({deletionRequests.length})
                </button>

                <button
                  type="button"
                  onClick={() => setDeletionStatusFilter('completed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    deletionStatusFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Completed ({completedDeletionsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setDeletionStatusFilter('dismissed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    deletionStatusFilter === 'dismissed'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Dismissed
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, email, member ID..."
                  value={deletionSearchQuery}
                  onChange={(e) => setDeletionSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-brand-plum bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* List of Deletion Requests */}
          <div className="space-y-4">
            {filteredDeletions.map((req) => {
              const isPending = req.status === 'pending';
              const isCompleted = req.status === 'completed';
              const isDismissed = req.status === 'dismissed';

              // Check if matching profile exists in system
              const matchedProfile = profiles.find(p => 
                (req.memberId && (String(p.id) === String(req.memberId) || String(p.regId) === String(req.memberId))) ||
                (req.phone && doesProfileHavePhone(p, req.phone)) ||
                (req.email && p.email && String(p.email).toLowerCase() === String(req.email).toLowerCase())
              );

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs space-y-4 transition-all ${
                    isPending
                      ? 'border-rose-300 ring-1 ring-rose-200/50'
                      : 'border-slate-200/80 opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPending ? 'bg-rose-100 text-rose-700' : isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-serif font-bold text-sm text-brand-charcoal">
                            {req.fullName || 'Member Profile'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPending
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Request ID: <span className="font-mono">{req.id}</span> • Submitted: {new Date(req.requestedAt || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {req.source === 'public_web' && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          Web Form (sambodhisarang.com)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Registered Credentials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Registered Phone</span>
                      <span className="font-bold text-brand-charcoal font-mono">{req.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Registered Email</span>
                      <span className="font-bold text-brand-charcoal">{req.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Member ID / Reg ID</span>
                      <span className="font-bold text-brand-charcoal font-mono">{req.memberId || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Reason Details */}
                  <div className="text-xs space-y-1">
                    <span className="text-gray-500 font-semibold block text-[11px]">Reason for Deletion:</span>
                    <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed">
                      <strong>{req.reason || 'Not specified'}</strong>
                      {req.customReason && <span className="block mt-1 text-gray-600 italic font-normal">"{req.customReason}"</span>}
                    </p>
                  </div>

                  {/* Matched Profile Notice */}
                  {matchedProfile ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-2">
                      <div className="text-amber-950">
                        <span className="font-bold">Active Profile Matched:</span> {matchedProfile.name} ({matchedProfile.regId || matchedProfile.id}) • {matchedProfile.gender} • {matchedProfile.district}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0">
                        In Database
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
                      Profile may have already been purged or registered with different contact information.
                    </div>
                  )}

                  {/* Administrative Notes / Execution timestamp if completed */}
                  {req.notes && (
                    <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Admin Note:</span>
                      <p>{req.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons for Pending Requests */}
                  {isPending && (
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDeletionReq(req);
                          setDeletionAdminNote('');
                          setShowProcessDeletionModal(true);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanently Purge & Delete Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const note = prompt('Enter optional reason for dismissing this deletion request:');
                          if (note !== null) {
                            dismissDeletionRequest(req.id, note);
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
                      >
                        Dismiss Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredDeletions.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-base text-slate-800">No Deletion Requests</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {deletionStatusFilter === 'pending'
                    ? 'All member account deletion requests have been processed! No pending requests awaiting review.'
                    : 'No requests match your selected filter.'}
                </p>
                {deletionStatusFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeletionStatusFilter('all');
                      setDeletionSearchQuery('');
                    }}
                    className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    View All Requests
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: PROCESS DELETION REQUEST */}
      {showProcessDeletionModal && selectedDeletionReq && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-rose-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-rose-900">
                  Confirm Permanent Account Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProcessDeletionModal(false);
                  setSelectedDeletionReq(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-1">
                <p className="font-bold">Member to be permanently deleted:</p>
                <p>Name: <strong>{selectedDeletionReq.fullName}</strong></p>
                <p>Phone: {selectedDeletionReq.phone || 'N/A'} • Email: {selectedDeletionReq.email || 'N/A'}</p>
                <p>Member ID: {selectedDeletionReq.memberId || 'N/A'}</p>
              </div>

              <p className="text-rose-900 font-semibold">
                Executing this action will permanently remove:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Candidate Firestore profile document</li>
                <li>All profile avatar photos and gallery pictures from Firebase Storage</li>
                <li>Uploaded Biodata PDF documents</li>
                <li>Associated connection interests and direct message traces</li>
              </ul>
              <p className="text-[11px] text-gray-500 pt-1">
                * A statutory compliance record is logged in deletion_logs (retaining only timestamp and ID for 180-day IT Act compliance) without personal demographics.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Administrator Notes / Resolution Remarks:
                </label>
                <input
                  type="text"
                  value={deletionAdminNote}
                  onChange={(e) => setDeletionAdminNote(e.target.value)}
                  placeholder="e.g. Identity verified via phone, account permanently purged."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isProcessingDeletion}
                onClick={() => {
                  setShowProcessDeletionModal(false);
                  setSelectedDeletionReq(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-brand-charcoal font-semibold text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessingDeletion}
                onClick={async () => {
                  setIsProcessingDeletion(true);
                  try {
                    await processDeletionRequest(selectedDeletionReq.id, {
                      notes: deletionAdminNote || 'Processed and permanently erased by Administrator.'
                    });
                    setShowProcessDeletionModal(false);
                    setSelectedDeletionReq(null);
                  } catch (err) {
                    console.error('Error processing deletion:', err);
                    alert('Failed to process deletion request.');
                  } finally {
                    setIsProcessingDeletion(false);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                {isProcessingDeletion ? (
                  <span>Purging Account...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm & Purge Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: WARN MEMBER */}
      {showWarnModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-amber-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-lg font-bold text-brand-plum">Issue Official Bureau Warning</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowWarnModal(false);
                  setWarnTarget(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSendWarnSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed font-medium">
                Warning recipient: <strong>{warnTarget?.targetName}</strong> (ID: {warnTarget?.targetUserId})
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Official Warning Message / ताकीद संदेश *
                </label>
                <textarea
                  rows={4}
                  required
                  value={warnMessageInput}
                  onChange={(e) => setWarnMessageInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  placeholder="Enter the official warning message to be delivered directly to the user..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarnModal(false);
                    setWarnTarget(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Send Warning & Resolve Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: ADMIN ACTION NOTES (RESOLVE / DISMISS) */}
      {showActionModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-brand-rose/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-brand-plum">
                {actionTarget?.actionType === 'resolve' ? 'Resolve Report' : 'Dismiss Report'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowActionModal(false);
                  setActionTarget(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleActionModalSubmit} className="space-y-4 text-xs">
              <p className="text-gray-600 leading-relaxed">
                {actionTarget?.actionType === 'resolve'
                  ? 'Record any administrative actions taken or audit notes before marking this report resolved:'
                  : 'Record the reason why this report is being dismissed:'}
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Resolution Notes (नोंद)</label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder={
                    actionTarget?.actionType === 'resolve'
                      ? 'e.g. Reviewed member details, verified evidence, user warned.'
                      : 'e.g. Report checked, content complies with terms of service.'
                  }
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-brand-plum focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionModal(false);
                    setActionTarget(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 ${
                    actionTarget?.actionType === 'resolve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-gray-700 hover:bg-gray-800'
                  }`}
                >
                  {actionTarget?.actionType === 'resolve' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Resolution</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Dismissal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
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
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={editingProfile.avatar || (Array.isArray(editingProfile.photos) && editingProfile.photos[0]) || '/default-avatar.png'}
                      alt={editingProfile.name || 'Profile'}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-brand-rose/30 shadow-md bg-white"
                    />
                    <WatermarkOverlay size="medium" />
                    {editingProfile.verified && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow z-20">
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
                    <label className="block font-semibold mb-1 text-gray-700 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-brand-plum" />
                        <span>Account Password (पासवर्ड)</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={editingProfile.password || ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, password: e.target.value })}
                        placeholder="Default: 123456"
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-mono font-bold text-brand-plum"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-brand-plum"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                    <label className="block font-semibold mb-1 text-gray-700">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={editingProfile.dob || ''}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newAge = calculateAgeFromDob(val);
                        setEditingProfile({
                          ...editingProfile,
                          dob: val,
                          age: newAge || editingProfile.age
                        });
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    />
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
                    <select
                      value={
                        editingProfile.caste?.toLowerCase() === 'bauddha'
                          ? 'Buddhist'
                          : (MAHARASHTRA_COMMUNITIES.includes(editingProfile.caste) ? editingProfile.caste : 'Other')
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setEditingProfile({ ...editingProfile, caste: 'Other', customCaste: '' });
                        } else {
                          setEditingProfile({ ...editingProfile, caste: val, customCaste: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum font-medium"
                    >
                      {MAHARASHTRA_COMMUNITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {(!MAHARASHTRA_COMMUNITIES.includes(editingProfile.caste?.toLowerCase() === 'bauddha' ? 'Buddhist' : editingProfile.caste) || editingProfile.caste === 'Other') && (
                      <input
                        type="text"
                        placeholder="Type custom caste..."
                        value={editingProfile.caste === 'Other' ? (editingProfile.customCaste || '') : (editingProfile.caste || '')}
                        onChange={(e) => setEditingProfile({ ...editingProfile, caste: e.target.value, customCaste: e.target.value })}
                        className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-plum/20"
                      />
                    )}
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
                      value={normalizeDistrict(editingProfile.district) || editingProfile.district || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, district: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                    >
                      <option value="">SELECT</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      {editingProfile.district && !DISTRICTS.includes(editingProfile.district) && !DISTRICTS.includes(normalizeDistrict(editingProfile.district)) && (
                        <option value={editingProfile.district}>{editingProfile.district}</option>
                      )}
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
                    <select
                      value={EDUCATION_LEVELS.includes(editingProfile.education) ? editingProfile.education : 'Other'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setEditingProfile({ ...editingProfile, education: 'Other', customEducation: '' });
                        } else {
                          setEditingProfile({ ...editingProfile, education: val, customEducation: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum font-medium"
                    >
                      {EDUCATION_LEVELS.map((edu) => (
                        <option key={edu} value={edu}>{edu}</option>
                      ))}
                    </select>
                    {(!EDUCATION_LEVELS.includes(editingProfile.education) || editingProfile.education === 'Other') && (
                      <input
                        type="text"
                        placeholder="Type custom degree / qualification..."
                        value={editingProfile.education === 'Other' ? (editingProfile.customEducation || '') : (editingProfile.education || '')}
                        onChange={(e) => setEditingProfile({ ...editingProfile, education: e.target.value, customEducation: e.target.value })}
                        className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-plum/20"
                      />
                    )}
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
                    <select
                      value={OCCUPATIONS.includes(editingProfile.occupation) ? editingProfile.occupation : 'Other'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setEditingProfile({ ...editingProfile, occupation: 'Other', customOccupation: '' });
                        } else {
                          setEditingProfile({ ...editingProfile, occupation: val, customOccupation: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum font-medium"
                    >
                      {OCCUPATIONS.map((occ) => (
                        <option key={occ} value={occ}>{occ}</option>
                      ))}
                    </select>
                    {(!OCCUPATIONS.includes(editingProfile.occupation) || editingProfile.occupation === 'Other') && (
                      <input
                        type="text"
                        placeholder="Type custom occupation / profession..."
                        value={editingProfile.occupation === 'Other' ? (editingProfile.customOccupation || '') : (editingProfile.occupation || '')}
                        onChange={(e) => setEditingProfile({ ...editingProfile, occupation: e.target.value, customOccupation: e.target.value })}
                        className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-plum/20"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Are you Government Employee ?</label>
                    <select
                      value={editingProfile.isGovtEmployee || 'No'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, isGovtEmployee: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 font-medium text-slate-800"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
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

                <div>
                  <label className="block font-semibold mb-1 text-brand-plum">Partner Expectations (अपेक्षा)</label>
                  <textarea
                    rows={3}
                    value={editingProfile.expectations || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, expectations: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-plum/30 bg-amber-50/20 focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum text-xs"
                    placeholder="Candidate's partner expectations..."
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

                      <button
                        type="button"
                        onClick={() => editBiodataFileInputRef.current?.click()}
                        className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-brand-plumDark transition-all flex items-center space-x-1.5 shrink-0"
                      >
                        <UploadCloud className="w-4 h-4 text-brand-gold" />
                        <span>Upload Biodata (PDF / IMG)</span>
                      </button>
                      <input
                        type="file"
                        ref={editBiodataFileInputRef}
                        accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleAdminBiodataUpload}
                        className="hidden"
                      />
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
                    <button
                      type="button"
                      onClick={() => newBiodataFileInputRef.current?.click()}
                      className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-brand-plumDark transition-all flex items-center space-x-1.5 shrink-0"
                    >
                      <UploadCloud className="w-4 h-4 text-brand-gold" />
                      <span>Upload Biodata PDF/IMG</span>
                    </button>
                    <input
                      type="file"
                      ref={newBiodataFileInputRef}
                      accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleNewBiodataUpload}
                      className="hidden"
                    />
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
                    <label className="block font-semibold mb-1 text-gray-700">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={newProfileForm.dob}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newAge = calculateAgeFromDob(val);
                        setNewProfileForm({
                          ...newProfileForm,
                          dob: val,
                          age: newAge || newProfileForm.age
                        });
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
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
                    <select
                      value={
                        newProfileForm.caste?.toLowerCase() === 'bauddha'
                          ? 'Buddhist'
                          : (MAHARASHTRA_COMMUNITIES.includes(newProfileForm.caste) ? newProfileForm.caste : 'Other')
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setNewProfileForm({ ...newProfileForm, caste: 'Other', customCaste: '' });
                        } else {
                          setNewProfileForm({ ...newProfileForm, caste: val, customCaste: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 font-medium"
                    >
                      {MAHARASHTRA_COMMUNITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {(!MAHARASHTRA_COMMUNITIES.includes(newProfileForm.caste?.toLowerCase() === 'bauddha' ? 'Buddhist' : newProfileForm.caste) || newProfileForm.caste === 'Other') && (
                      <input
                        type="text"
                        placeholder="Type custom caste..."
                        value={newProfileForm.caste === 'Other' ? (newProfileForm.customCaste || '') : newProfileForm.caste}
                        onChange={(e) => setNewProfileForm({ ...newProfileForm, caste: e.target.value, customCaste: e.target.value })}
                        className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-plum/20"
                      />
                    )}
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
                      value={normalizeDistrict(newProfileForm.district) || newProfileForm.district || ''}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, district: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    >
                      <option value="">SELECT</option>
                      {DISTRICTS.map((d) => (
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
                    <label className="block font-semibold mb-1 text-gray-700">Education Degree</label>
                    <select
                      value={EDUCATION_LEVELS.includes(newProfileForm.education) ? newProfileForm.education : 'Other'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setNewProfileForm({ ...newProfileForm, education: 'Other', customEducation: '' });
                        } else {
                          setNewProfileForm({ ...newProfileForm, education: val, customEducation: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 font-medium"
                    >
                      {EDUCATION_LEVELS.map((edu) => (
                        <option key={edu} value={edu}>{edu}</option>
                      ))}
                    </select>
                    {(!EDUCATION_LEVELS.includes(newProfileForm.education) || newProfileForm.education === 'Other') && (
                      <input
                        type="text"
                        placeholder="Type custom degree / qualification..."
                        value={newProfileForm.education === 'Other' ? (newProfileForm.customEducation || '') : newProfileForm.education}
                        onChange={(e) => setNewProfileForm({ ...newProfileForm, education: e.target.value, customEducation: e.target.value })}
                        className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-plum/20"
                      />
                    )}
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
                    <label className="block font-semibold mb-1 text-gray-700">Occupation / Profession</label>
                    <select
                      value={OCCUPATIONS.includes(newProfileForm.occupation) ? newProfileForm.occupation : 'Other'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setNewProfileForm({ ...newProfileForm, occupation: 'Other', customOccupation: '' });
                        } else {
                          setNewProfileForm({ ...newProfileForm, occupation: val, customOccupation: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 font-medium"
                    >
                      {OCCUPATIONS.map((occ) => (
                        <option key={occ} value={occ}>{occ}</option>
                      ))}
                    </select>
                    {(!OCCUPATIONS.includes(newProfileForm.occupation) || newProfileForm.occupation === 'Other') && (
                      <input
                        type="text"
                        placeholder="Type custom occupation / profession..."
                        value={newProfileForm.occupation === 'Other' ? (newProfileForm.customOccupation || '') : newProfileForm.occupation}
                        onChange={(e) => setNewProfileForm({ ...newProfileForm, occupation: e.target.value, customOccupation: e.target.value })}
                        className="w-full mt-2 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-plum/20"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Are you Government Employee ?</label>
                    <select
                      value={newProfileForm.isGovtEmployee || 'No'}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, isGovtEmployee: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 font-medium text-slate-800"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
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
                    placeholder="Brief family background..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-plum">Partner Expectations (अपेक्षा)</label>
                  <textarea
                    rows={3}
                    value={newProfileForm.expectations || ''}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, expectations: e.target.value })}
                    placeholder="Candidate's partner expectations..."
                    className="w-full p-2.5 rounded-xl border border-brand-plum/30 bg-amber-50/20 focus:ring-2 focus:ring-brand-plum/20 text-xs"
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

      {/* MODAL: RESET MEMBER PASSWORD */}
      {showResetPassModal && resetPassTarget && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-brand-rose/30 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-plum">Reset Member Password</h3>
                  <p className="text-[11px] text-gray-500">Set new login password for candidate profile</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowResetPassModal(false);
                  setResetPassTarget(null);
                }} 
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Candidate Summary Card */}
            <div className="bg-brand-lightBg/60 p-4 rounded-2xl border border-brand-rose/20 flex items-center space-x-3">
              <img
                src={resetPassTarget.avatar || (Array.isArray(resetPassTarget.photos) && resetPassTarget.photos[0]) || '/default-avatar.png'}
                alt={resetPassTarget.name}
                className="w-12 h-12 rounded-full object-cover border border-brand-rose/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-brand-plum text-sm truncate">{resetPassTarget.name}</h4>
                <p className="text-[11px] font-semibold text-brand-kesari">
                  Profile No. {resetPassTarget.registrationId || (resetPassTarget.regId ? String(resetPassTarget.regId).replace(/^SS-?/i, '') : '1001')}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {resetPassTarget.email || resetPassTarget.phone || 'No email/phone'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-charcoal mb-1.5">
                  New Password for {resetPassTarget.name} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showResetPasswordText ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 font-mono text-xs font-bold text-brand-plum focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordText(!showResetPasswordText)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-plum"
                  >
                    {showResetPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Helpers */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewPasswordVal('123456');
                    setShowResetPasswordText(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[11px] border border-slate-300 transition-all"
                >
                  Set Default (123456)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const randomPass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
                    setNewPasswordVal(randomPass);
                    setShowResetPasswordText(true);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-xl text-[11px] border border-amber-300 transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 text-amber-700" />
                  <span>Generate Quick Password</span>
                </button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed font-medium">
                💡 <strong>Info:</strong> Once updated, candidate can log into their account using this new password immediately.
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassModal(false);
                    setResetPassTarget(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 border border-brand-gold/30"
                >
                  <Key className="w-4 h-4 text-brand-gold" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* Admin Live Preview of Site Announcement Modal */}
      {showPopupPreview && (
        <SiteAnnouncementModal
          forceOpen={true}
          overrideContent={editableHomeContent?.popupAd}
          onClose={() => setShowPopupPreview(false)}
        />
      )}

    </div>
  );
};
