import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES } from '../data/maharashtraData';
import { compressImage } from '../utils/imageCompressor';
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
  Image as ImageIcon
} from 'lucide-react';

export const AdminPage = ({ onNavigate }) => {
  const { isAuthenticated, isAdmin, loginAsAdmin } = useAuth();
  const { t } = useLanguage();
  const { 
    profiles, 
    toggleVerifyProfile, 
    updateAdminProfile, 
    deleteProfile,
    homeContent,
    updateHomeContent,
    stories,
    addSuccessStory,
    updateSuccessStory,
    deleteSuccessStory,
    addToast 
  } = useProfiles();

  const [activeTab, setActiveTab] = useState('profiles'); // 'overview', 'profiles', 'content', 'stories', 'inquiries'

  // Profile Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

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
    photoUrl: '/story1.jpg'
  });

  // Bureau Contact Info (Editable)
  const [contactInfo, setContactInfo] = useState({
    phone: '+91 9823425404',
    email: 'pk9823435404@gmail.com',
    address: 'Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra'
  });

  // Mock Support Messages Queue
  const [inquiries, setInquiries] = useState([
    { id: 1, name: 'Suhas Patil', phone: '+91 98230 11223', email: 'suhas.patil@gmail.com', message: 'I would like to verify biodata PDF for profile ID p1.', date: 'Today, 10:15 AM', resolved: false },
    { id: 2, name: 'Sunita Deshmukh', phone: '+91 98900 44556', email: 'sunita.d@gmail.com', message: 'Interested in registration assistance for my son in Ichalkaranji.', date: 'Yesterday, 4:30 PM', resolved: true },
    { id: 3, name: 'Rajesh Kulkarni', phone: '+91 97654 32100', email: 'rajesh.k@gmail.com', message: 'Please update my native place to Kolhapur.', date: 'Aug 30, 2026', resolved: false }
  ]);

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
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.caste?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.regId && p.regId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.registrationId && String(p.registrationId).includes(searchQuery.trim()));

    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && p.verified) || 
      (verificationFilter === 'unverified' && !p.verified);

    const matchesDistrict = districtFilter === 'all' || p.district === districtFilter;

    return matchesSearch && matchesGender && matchesVerification && matchesDistrict;
  });

  const verifiedCount = profiles.filter((p) => p.verified).length;
  const unverifiedCount = profiles.filter((p) => !p.verified).length;

  const handleOpenEdit = (p) => {
    setEditingProfile({ ...p });
    setShowEditModal(true);
  };

  const handleSaveEditedProfile = (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    updateAdminProfile(editingProfile.id, editingProfile);
    setShowEditModal(false);
    setEditingProfile(null);
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
      const compressed = await compressImage(file, 800, 800, 0.8);
      setNewStoryData((prev) => ({ ...prev, photoUrl: compressed }));
      addToast('Photo uploaded from device successfully!', 'success');
    } catch (err) {
      console.error('Error compressing story photo:', err);
    }
  };

  const handleEditStoryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      const compressed = await compressImage(file, 800, 800, 0.8);
      setEditingStory((prev) => ({ ...prev, photoUrl: compressed }));
      addToast('Photo uploaded from device successfully!', 'success');
    } catch (err) {
      console.error('Error compressing story photo:', err);
    }
  };

  const handleOpenEditStory = (story) => {
    setEditingStory({
      id: story.id,
      names: story.names || '',
      location: story.location || '',
      quote: story.quote || '',
      weddingDate: story.weddingDate || '',
      photoUrl: story.photos?.[0]?.url || '/story1.jpg'
    });
    setShowEditStoryModal(true);
  };

  const handleSaveEditedStory = (e) => {
    e.preventDefault();
    if (!editingStory) return;
    updateSuccessStory(editingStory.id, {
      names: editingStory.names,
      location: editingStory.location,
      quote: editingStory.quote,
      weddingDate: editingStory.weddingDate,
      photos: [{ url: editingStory.photoUrl || '/story1.jpg', caption: `${editingStory.names} Wedding` }]
    });
    setShowEditStoryModal(false);
    setEditingStory(null);
  };

  const handleSaveNewStory = (e) => {
    e.preventDefault();
    addSuccessStory({
      names: newStoryData.names,
      location: newStoryData.location,
      quote: newStoryData.quote,
      weddingDate: newStoryData.weddingDate,
      photos: [{ url: newStoryData.photoUrl || '/story1.jpg', caption: `${newStoryData.names} Wedding` }]
    });
    setShowAddStoryModal(false);
    setNewStoryData({
      names: '',
      location: 'Ichalkaranji & Kolhapur',
      quote: '“We found our perfect life partner through Sambodhi Sarang Marriage Bureau!”',
      weddingDate: 'February 2026 • Ichalkaranji Wedding Hall',
      photoUrl: '/story1.jpg'
    });
  };

  const toggleResolveInquiry = (id) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item))
    );
    addToast('Inquiry status updated!', 'success');
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('profiles')}
                className="p-4 bg-brand-lightBg hover:bg-brand-plum hover:text-white rounded-2xl border border-brand-rose/20 transition-all font-bold text-xs flex items-center justify-center space-x-2 text-brand-plum"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify / Manage Profiles (1-Click)</span>
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
          <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-brand-gray absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, caste, district..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-charcoal"
                >
                  <option value="all">All Genders</option>
                  <option value="female">Brides (Female)</option>
                  <option value="male">Grooms (Male)</option>
                </select>

                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-charcoal"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-charcoal"
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
                    <th className="p-4 font-bold">Verification Badge</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-brand-ivory/50 transition-colors">
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.avatar || p.photos?.[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-full object-cover border border-brand-rose/30"
                          />
                          <div>
                            <p className="font-bold text-brand-plum">{p.name}</p>
                            <p className="text-[10px] font-bold text-brand-kesari">Reg ID: {p.regId || `SS-${p.registrationId || 1001}`}</p>
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

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
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
                  ))}
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
            <h3 className="font-serif font-bold text-xl text-brand-plum">Customer Helpline & Inquiries</h3>

            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    inq.resolved ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-brand-lightBg/60 border-brand-rose/30 shadow-sm'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-brand-plum text-sm">{inq.name}</span>
                      <span className="text-[10px] text-gray-500">{inq.date}</span>
                    </div>
                    <p className="text-brand-charcoal font-medium">{inq.message}</p>
                    <div className="flex items-center space-x-4 text-[11px] text-brand-gray pt-1">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-brand-plum" />
                        <span>{inq.phone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-brand-plum" />
                        <span>{inq.email}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleResolveInquiry(inq.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      inq.resolved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-brand-plum text-white shadow hover:bg-brand-plumDark'
                    }`}
                  >
                    {inq.resolved ? '✓ Resolved' : 'Mark as Resolved'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUCCESS STORY */}
      {showAddStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                <label className="block font-semibold mb-1">Wedding Photo Image *</label>
                <div className="flex items-center gap-3 mb-2">
                  {newStoryData.photoUrl && (
                    <img src={newStoryData.photoUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-brand-rose/40" />
                  )}
                  <label className="cursor-pointer px-4 py-2.5 bg-brand-lightBg border border-brand-rose/30 text-brand-plum font-bold rounded-xl hover:bg-brand-rose/10 transition-all flex items-center space-x-2 text-xs">
                    <Camera className="w-4 h-4 text-brand-plum" />
                    <span>Upload Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddStoryPhotoUpload}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mb-1">Or paste an image URL below:</p>
                <input
                  type="text"
                  required
                  value={newStoryData.photoUrl}
                  onChange={(e) => setNewStoryData({ ...newStoryData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
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
        </div>
      )}

      {/* MODAL: EDIT SUCCESS STORY */}
      {showEditStoryModal && editingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                <label className="block font-semibold mb-1">Wedding Photo Image *</label>
                <div className="flex items-center gap-3 mb-2">
                  {editingStory.photoUrl && (
                    <img src={editingStory.photoUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-brand-rose/40" />
                  )}
                  <label className="cursor-pointer px-4 py-2.5 bg-brand-lightBg border border-brand-rose/30 text-brand-plum font-bold rounded-xl hover:bg-brand-rose/10 transition-all flex items-center space-x-2 text-xs">
                    <Camera className="w-4 h-4 text-brand-plum" />
                    <span>Upload Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditStoryPhotoUpload}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mb-1">Or paste an image URL below:</p>
                <input
                  type="text"
                  required
                  value={editingStory.photoUrl}
                  onChange={(e) => setEditingStory({ ...editingStory, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
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
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-brand-rose/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-brand-plum">Edit Member Profile (Admin)</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={editingProfile.age}
                    onChange={(e) => setEditingProfile({ ...editingProfile, age: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">District / City *</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.district}
                    onChange={(e) => setEditingProfile({ ...editingProfile, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Caste *</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.caste}
                    onChange={(e) => setEditingProfile({ ...editingProfile, caste: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
        </div>
      )}

    </div>
  );
};
