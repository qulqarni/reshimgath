import React, { useState, useRef } from 'react';
import { uploadBiodataPdfToFirebase } from '../../services/firebaseService';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  X,
  FileCheck,
  Printer,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Home,
  MapPin,
  Heart,
  Loader2
} from 'lucide-react';

export const BiodataPdfSection = ({ user, updateProfile, isEditable = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const fileInputRef = useRef(null);

  const biodata = user?.biodataPdf || null;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Candidate';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      alert('Please select a valid PDF document or Image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller file.');
      return;
    }

    setIsUploading(true);

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    try {
      // Upload PDF / Image directly to Firebase Storage
      const firebaseStorageUrl = await uploadBiodataPdfToFirebase(file, user?.id || user?.regId || 'guest');
      
      const newBiodata = {
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileType: isImage ? 'image' : 'pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        url: firebaseStorageUrl
      };

      if (updateProfile) {
        await updateProfile({ biodataPdf: newBiodata });
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to upload Biodata to Firebase Storage:', error);
      alert('Failed to upload file to Firebase Storage. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove your uploaded Biodata?')) {
      if (updateProfile) {
        updateProfile({ biodataPdf: null });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isBiodataImage = biodata?.fileType === 'image' || biodata?.url?.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(biodata?.fileName || '');
  const candidatePhoto = (user?.photos && user.photos.length > 0) ? user.photos[0] : (user?.avatar || null);

  const hasVal = (val) => val !== null && val !== undefined && String(val).trim().length > 0;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4 w-full max-w-full overflow-hidden">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <FileText className="w-4 h-4 text-amber-700" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-plum truncate">
              Candidate Biodata
            </h3>
            <p className="text-[10px] text-brand-gray font-medium truncate">
              बायोडेटा दस्तावेज
            </p>
          </div>
        </div>

        {biodata ? (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full shrink-0">
            Uploaded PDF/IMG
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-bold rounded-full shrink-0">
            Digital Format
          </span>
        )}
      </div>

      {uploadSuccess && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl font-bold border border-emerald-200 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Biodata Uploaded Successfully!</span>
        </div>
      )}

      {/* Main Content Area */}
      {biodata ? (
        /* Uploaded Biodata File Box */
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-plum text-brand-gold flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {isBiodataImage ? 'IMG' : 'PDF'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-bold text-xs text-brand-plum truncate">
                {biodata.fileName}
              </h4>
              <div className="flex items-center space-x-2 text-[11px] text-brand-gray mt-0.5">
                <span>{biodata.fileSize}</span>
                <span>•</span>
                <span>Uploaded {biodata.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowViewerModal(true)}
              className="flex-1 py-2 px-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>View Biodata</span>
            </button>

            <a
              href={biodata.url || '#'}
              download={biodata.fileName || 'Biodata'}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-white text-brand-charcoal border border-gray-200 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-brand-plum shrink-0" />
              <span>Download</span>
            </a>

            {isEditable && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all"
                  title="Replace Biodata"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Remove Biodata"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Digital Biodata Card View */
        <div className="bg-gradient-to-br from-amber-50/40 via-white to-rose-50/40 rounded-2xl p-4 border border-brand-rose/20 space-y-3">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-xs text-brand-plum flex items-center space-x-1.5">
              <span>{firstName}'s Matrimonial Biodata</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h4>
            <p className="text-[11px] text-brand-gray leading-relaxed">
              Complete verified Maharashtrian biodata format with personal, education, career, and family details.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowViewerModal(true)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
            >
              <Eye className="w-4 h-4 text-brand-gold shrink-0" />
              <span>View Biodata / बायोडेटा पहा</span>
            </button>

            {isEditable && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2 px-3 bg-white text-brand-plum border border-brand-rose/30 font-bold text-xs rounded-xl hover:bg-brand-lightBg transition-all flex items-center justify-center space-x-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5 text-brand-plum" />
                <span>Upload PDF / Image Biodata File</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* FULL SCREEN BIODATA VIEWER MODAL */}
      {showViewerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-gray-200 my-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
            
            {/* Modal Top Bar (Hidden during Print) */}
            <div className="bg-brand-plum text-white px-5 py-3.5 flex items-center justify-between border-b border-brand-gold/30 shrink-0 print:hidden">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-brand-gold text-brand-plum flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <FileCheck className="w-4 h-4 text-brand-plum stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm text-white truncate">
                    {user?.name || 'Candidate'} — Matrimonial Biodata
                  </h3>
                  <p className="text-[11px] text-brand-rose/80 truncate">
                    Reg ID: SS-{user?.registrationId || user?.regId || 1001} • Confidential
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-brand-gold hover:bg-amber-300 text-brand-plum font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-plum" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                  <span className="sm:hidden">Print</span>
                </button>

                {biodata && (
                  <a
                    href={biodata.url || '#'}
                    download={biodata.fileName || 'Biodata'}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="hidden sm:inline">Download File</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setShowViewerModal(false)}
                  className="p-1.5 text-brand-rose hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Printed Maharashtrian Matrimonial Biodata */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-amber-50/20 text-brand-charcoal">
              
              {/* Uploaded Image / PDF Banner (If Available) */}
              {biodata && (
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center space-y-3 print:hidden">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gray block">
                    Uploaded Document Attachment
                  </span>
                  {isBiodataImage ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <img 
                        src={biodata.url} 
                        alt="Uploaded Biodata" 
                        className="max-w-full max-h-[50vh] object-contain rounded-xl shadow border border-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between gap-3 border border-slate-200">
                      <div className="flex items-center space-x-3 text-left">
                        <FileText className="w-8 h-8 text-brand-plum shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-brand-plum">{biodata.fileName}</p>
                          <p className="text-[10px] text-brand-gray">{biodata.fileSize}</p>
                        </div>
                      </div>
                      <a
                        href={biodata.url || '#'}
                        download={biodata.fileName || 'Biodata.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow shrink-0"
                      >
                        Open PDF
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* DIGITAL MAHARASHTRIAN BIODATA DOCUMENT */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-6 max-w-2xl mx-auto">
                
                {/* Traditional Header */}
                <div className="text-center space-y-1 border-b-2 border-brand-plum/20 pb-5">
                  <div className="text-amber-700 font-bold font-serif-marathi text-sm tracking-widest">
                    ॥ श्री गणेशाय नमः ॥
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
                    संबोधी सारंग विवाह बायोडेटा
                  </h1>
                  <p className="text-xs text-brand-kesari font-semibold tracking-wide">
                    Sambodhi Sarang Matrimonial Bureau • Registration ID: SS-{user?.registrationId || user?.regId || 1001}
                  </p>
                </div>

                {/* Candidate Photo & Header Info */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200/60">
                  {candidatePhoto ? (
                    <img 
                      src={candidatePhoto} 
                      alt={user?.name} 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-brand-plum shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-3xl border-2 border-brand-plum shrink-0">
                      {firstName[0]}
                    </div>
                  )}

                  <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-plum">
                      {user?.name}
                    </h2>
                    <p className="text-xs text-brand-charcoal font-semibold">
                      {hasVal(user?.age) && <span>{user.age} वर्षे</span>}
                      {hasVal(user?.height) && <span> • {user.height}</span>}
                      {hasVal(user?.district) && <span> • {user.district}, महाराष्ट्र</span>}
                    </p>
                    {hasVal(user?.education) && (
                      <p className="text-xs text-brand-gray font-medium">
                        {user.education} {hasVal(user?.occupation) ? `• ${user.occupation}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* 1. Personal Details Section */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-brand-kesari" />
                    <span>१. वैयक्तिक माहिती (Personal Details)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">संपूर्ण नाव:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.name || '-'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">जन्मतारीख / वय:</span>
                      <span className="font-bold text-brand-plum text-right">
                        {user?.dob ? `${user.dob} (${user.age} Yrs)` : `${user?.age || '-'} Yrs`}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">उंची:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.height || '-'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">वैवाहिक स्थिती:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.maritalStatus || 'Never Married'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">धर्म / जात:</span>
                      <span className="font-bold text-brand-plum text-right">
                        {user?.religion || 'Hindu'} {user?.caste ? `- ${user.caste}` : ''}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">मातृभाषा:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.motherTongue || 'Marathi'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50 sm:col-span-2">
                      <span className="text-brand-gray font-medium">मूळ गाव (Native Place):</span>
                      <span className="font-bold text-brand-plum text-right">{user?.nativePlace || user?.district || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Education & Occupation Section */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-brand-kesari" />
                    <span>२. शैक्षणिक व नोकरीची माहिती (Education & Career)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">शिक्षण पदवी:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.education || '-'}</span>
                    </div>

                    {hasVal(user?.college) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">कॉलेज / संस्था:</span>
                        <span className="font-bold text-brand-plum text-right">{user.college}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">नोकरी / व्यवसाय:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.occupation || '-'}</span>
                    </div>

                    {hasVal(user?.company) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">कंपनी / ठिकाण:</span>
                        <span className="font-bold text-brand-plum text-right">{user.company}</span>
                      </div>
                    )}

                    {hasVal(user?.income) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">वार्षिक उत्पन्न:</span>
                        <span className="font-bold text-brand-plum text-right">{user.income}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-brand-gray font-medium">नोकरीचे शहर / जिल्हा:</span>
                      <span className="font-bold text-brand-plum text-right">{user?.district || '-'}, महाराष्ट्र</span>
                    </div>
                  </div>
                </div>

                {/* 3. Family Background Section */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
                    <Home className="w-3.5 h-3.5 text-brand-kesari" />
                    <span>३. कौटुंबिक माहिती (Family Background)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {hasVal(user?.fatherOccupation) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">वडिलांचा व्यवसाय:</span>
                        <span className="font-bold text-brand-plum text-right">{user.fatherOccupation}</span>
                      </div>
                    )}

                    {hasVal(user?.motherOccupation) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">आईचा व्यवसाय:</span>
                        <span className="font-bold text-brand-plum text-right">{user.motherOccupation}</span>
                      </div>
                    )}

                    {hasVal(user?.familyType) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">कुटुंब प्रकार:</span>
                        <span className="font-bold text-brand-plum text-right">{user.familyType}</span>
                      </div>
                    )}

                    {hasVal(user?.siblings) && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-brand-gray font-medium">भाऊ / बहीण:</span>
                        <span className="font-bold text-brand-plum text-right">{user.siblings}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer seal */}
                <div className="pt-4 border-t border-amber-200/80 text-center space-y-1">
                  <p className="text-[10px] text-brand-plum font-bold tracking-wider uppercase">
                    संबोधी सारंग विवाह संस्था • इचलकरंजी, महाराष्ट्र
                  </p>
                  <p className="text-[9px] text-brand-gray italic">
                    Certified Profile Document • Generated on Sambodhi Sarang Matrimony
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
