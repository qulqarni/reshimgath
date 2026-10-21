import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { uploadFileToFirebaseStorage } from '../services/firebaseService';
import { 
  MessageSquareHeart, 
  Plus, 
  X, 
  Star, 
  Send, 
  CheckCircle2, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  ShieldCheck,
  Play,
  UploadCloud,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const FeedbacksPage = () => {
  const { lang } = useLanguage();
  const { feedbacks, addFeedback } = useProfiles();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'text' | 'photo' | 'video'
  const [showModal, setShowModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    type: 'text', // 'text' | 'photo' | 'video'
    message: '',
    rating: 5,
    mediaFile: null,
    consent: false
  });

  // Filter approved and published feedback for public display
  const approvedFeedbacks = (feedbacks || []).filter(
    (fb) => fb.status === 'approved' && fb.published !== false
  );

  const filteredFeedbacks = approvedFeedbacks.filter((fb) => {
    if (activeTab === 'all') return true;
    return fb.type === activeTab;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert('Please enter your feedback message.');
      return;
    }
    if (!formData.consent) {
      alert('Please agree to share your feedback publicly upon verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrl = null;
      let videoUrl = null;

      if (formData.mediaFile) {
        const file = formData.mediaFile;
        const ext = file.name.split('.').pop() || 'dat';
        const storagePath = `feedbacks/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadedUrl = await uploadFileToFirebaseStorage(file, storagePath, file.type);
        if (formData.type === 'video') {
          videoUrl = uploadedUrl;
        } else {
          mediaUrl = uploadedUrl;
        }
      }

      addFeedback({
        name: formData.name.trim() || 'Anonymous Well-Wisher',
        type: formData.type,
        message: formData.message.trim(),
        mediaUrl,
        videoUrl,
        rating: formData.rating,
        status: 'pending', // Pending approval by default
        published: false
      });

      setSubmittedSuccess(true);
      setFormData({
        name: user?.name || '',
        type: 'text',
        message: '',
        rating: 5,
        mediaFile: null,
        consent: false
      });
      setTimeout(() => {
        setSubmittedSuccess(false);
        setShowModal(false);
      }, 3500);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-lightBg/40 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-brand-rose/20">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-rose/20 text-brand-plum text-xs font-bold border border-brand-rose/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{lang === 'en' ? 'Community Testimonials' : 'सदस्यांचे अनुभव व प्रतिक्रिया'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum">
              {lang === 'en' ? 'User Feedbacks & Testimonials' : 'अभिप्राय आणि प्रतिक्रिया'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-gray max-w-2xl">
              {lang === 'en'
                ? 'Read genuine experiences and heartwarming words shared by brides, grooms, and parents who trusted Sambodhi Sarang Marriage Bureau.'
                : 'संबोधी सारंगवर विश्वास दाखवणाऱ्या हजारो वधू-वर आणि पालकांनी व्यक्त केलेल्या प्रामाणिक प्रतिक्रिया.'}
            </p>
          </div>

          {/* Share Your Feedback CTA Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs sm:text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center space-x-2 border border-brand-gold/40 shrink-0"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>{lang === 'en' ? 'Share Your Feedback' : 'तुमचा अभिप्राय नोंदवा'}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Feedbacks', icon: MessageSquareHeart },
            { id: 'text', label: 'Written Testimonials', icon: FileText },
            { id: 'photo', label: 'Photo Stories', icon: ImageIcon },
            { id: 'video', label: 'Video Testimonials', icon: VideoIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                  isActive
                    ? 'bg-brand-plum text-white shadow-md'
                    : 'bg-white text-brand-charcoal hover:bg-brand-lightBg border border-brand-rose/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-brand-plum'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedbacks Grid */}
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-rose/20 shadow-luxury space-y-3">
            <MessageSquareHeart className="w-12 h-12 text-brand-rose mx-auto" />
            <h3 className="font-serif font-bold text-lg text-brand-plum">
              {lang === 'en' ? 'No Feedbacks in this category yet' : 'या विभागात अद्याप कोणताही अभिप्राय नाही'}
            </h3>
            <p className="text-xs text-brand-gray">
              {lang === 'en'
                ? 'Be the first to share your experience with Sambodhi Sarang!'
                : 'संबोधी सारंगसोबतचा आपला सुखद अनुभव सर्वप्रथम नोंदवा!'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 px-5 py-2.5 bg-brand-plum text-white text-xs font-bold rounded-xl shadow hover:bg-brand-plumDark transition-all"
            >
              Share Your Feedback
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-3xl p-6 border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col justify-between space-y-4"
              >
                {/* Media Preview (Photo or Video) */}
                {fb.type === 'photo' && fb.mediaUrl && (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-brand-plum/10 border border-brand-rose/20">
                    <img
                      src={fb.mediaUrl}
                      alt={fb.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {fb.type === 'video' && fb.videoUrl && (
                  <div 
                    onClick={() => setActiveVideoModal(fb.videoUrl)}
                    className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-1" />
                    </div>
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold">
                      Click to Play Video
                    </span>
                  </div>
                )}

                {/* Stars Rating */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                {/* Message */}
                <p className="text-xs sm:text-sm text-brand-charcoal leading-relaxed italic flex-1">
                  “{fb.message}”
                </p>

                {/* User Info & Date Footer */}
                <div className="pt-3 border-t border-brand-rose/15 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-serif font-bold text-brand-plum text-sm">{fb.name}</h4>
                    {fb.date && (
                      <span className="text-[10px] text-brand-gray flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-brand-plum" />
                        <span>{fb.date}</span>
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified User</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {activeVideoModal && (
          <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-black rounded-3xl overflow-hidden max-w-2xl w-full relative shadow-2xl border border-white/20">
              <button
                onClick={() => setActiveVideoModal(null)}
                className="absolute top-3 right-3 z-30 p-2 text-white bg-black/60 rounded-full hover:bg-black/90"
              >
                <X className="w-6 h-6" />
              </button>
              <video
                src={activeVideoModal}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}

        {/* FEEDBACK SUBMISSION MODAL */}
        {showModal && (
          <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative shadow-2xl border border-brand-rose/20 my-auto animate-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-brand-plum p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-2xl text-brand-plum">
                  {lang === 'en' ? 'Share Your Experience' : 'तुमचा अनुभव शेअर करा'}
                </h3>
                <p className="text-xs text-brand-gray">
                  Your review helps other families find trust and hope. All feedback is verified before publishing.
                </p>
              </div>

              {submittedSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-emerald-900 text-base">Feedback Submitted!</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you for sharing your experience. Our administrator will review and publish your feedback shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-brand-charcoal mb-1">
                      Your Name / Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul & Swara Patil"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  {/* Feedback Type */}
                  <div>
                    <label className="block text-brand-charcoal mb-1">Feedback Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'text', label: 'Written' },
                        { id: 'photo', label: 'With Photo' },
                        { id: 'video', label: 'With Video' }
                      ].map((typeOption) => (
                        <button
                          key={typeOption.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: typeOption.id, mediaFile: null })}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            formData.type === typeOption.id
                              ? 'bg-brand-plum text-white border-brand-plum shadow-sm'
                              : 'bg-gray-50 text-brand-charcoal border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {typeOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-brand-charcoal mb-1">Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: starVal })}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= formData.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Upload */}
                  {(formData.type === 'photo' || formData.type === 'video') && (
                    <div>
                      <label className="block text-brand-charcoal mb-1">
                        Upload {formData.type === 'video' ? 'Video (max 25MB)' : 'Photo (JPG/PNG, max 10MB)'}
                      </label>
                      <input
                        type="file"
                        accept={formData.type === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png'}
                        onChange={(e) => setFormData({ ...formData, mediaFile: e.target.files[0] })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-plum file:text-white"
                      />
                    </div>
                  )}

                  {/* Feedback Message */}
                  <div>
                    <label className="block text-brand-charcoal mb-1">Your Feedback Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your experience with Sambodhi Sarang Marriage Bureau..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                    />
                  </div>

                  {/* User Consent Checkbox */}
                  <div className="flex items-start space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="feedback_consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 rounded text-brand-plum focus:ring-brand-plum"
                    />
                    <label htmlFor="feedback_consent" className="text-[11px] text-brand-gray font-normal leading-tight">
                      I consent to Sambodhi Sarang Marriage Bureau displaying my feedback, name, and uploaded media publicly on this website upon editorial review.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-brand-gold/30 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                        <span>Submitting Feedback...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-brand-gold" />
                        <span>Submit Feedback for Approval</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
