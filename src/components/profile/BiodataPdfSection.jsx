import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  X,
  FileCheck,
  User,
  Heart
} from 'lucide-react';

export const BiodataPdfSection = ({ user, updateProfile, isEditable = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const fileInputRef = useRef(null);

  const biodata = user?.biodataPdf || null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF document file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller PDF file.');
      return;
    }

    setIsUploading(true);

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      const newBiodata = {
        fileName: file.name,
        fileSize: fileSizeFormatted,
        uploadedAt: new Date().toISOString().split('T')[0],
        url: base64Url
      };

      updateProfile({ biodataPdf: newBiodata });
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove your uploaded Biodata PDF?')) {
      updateProfile({ biodataPdf: null });
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-rose/15 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-plum text-brand-gold flex items-center justify-center border border-brand-gold/40 shadow-sm shrink-0">
            <FileText className="w-5 h-5 fill-brand-kesari/20 text-brand-gold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-lg font-bold text-brand-plum">Biodata (बायोडेटा PDF)</h3>
              <span className="bg-brand-kesari/10 text-brand-kesari text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-kesari/30">
                PDF Format
              </span>
            </div>
            <p className="text-xs text-brand-gray">
              Upload your complete family biodata PDF to share with interested families & prospective matches.
            </p>
          </div>
        </div>

        {uploadSuccess && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-bold border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Biodata PDF Uploaded!</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {biodata ? (
        <div className="bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-amber-50/70 rounded-2xl p-5 border border-brand-gold/40 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* File Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-plum text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
                PDF
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-brand-plum truncate max-w-xs">
                  {biodata.fileName}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-brand-gray mt-0.5">
                  <span>Size: {biodata.fileSize}</span>
                  <span>•</span>
                  <span>Uploaded: {biodata.uploadedAt}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowViewerModal(true)}
                className="px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-brand-gold shrink-0" />
                <span>View Biodata</span>
              </button>

              <a
                href={biodata.url || '#'}
                download={biodata.fileName || 'Biodata.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white text-brand-plum border border-brand-plum/30 font-bold text-xs rounded-xl hover:bg-brand-lightBg transition-all flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4 text-brand-kesari shrink-0" />
                <span>Download</span>
              </a>

              {isEditable && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-2 bg-amber-50 text-brand-kesari border border-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all flex items-center space-x-1"
                    title="Upload New PDF"
                  >
                    <UploadCloud className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Replace</span>
                  </button>

                  <button
                    onClick={handleRemove}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                    title="Remove PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Box */
        <div 
          onClick={() => isEditable && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-brand-rose/40 hover:border-brand-plum bg-brand-ivory/60 hover:bg-white rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isUploading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center mx-auto shadow-inner">
              <UploadCloud className="w-6 h-6 text-brand-plum" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-brand-plum">
                {isUploading ? 'Uploading Biodata PDF...' : 'Click to Upload Your Biodata PDF'}
              </h4>
              <p className="text-xs text-brand-gray mt-1">
                Upload your detailed Biodata (PDF format, up to 10MB)
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-block px-4 py-2 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:scale-105 transition-all">
                Select PDF File
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN BIODATA VIEWER MODAL */}
      {showViewerModal && biodata && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
            
            {/* Modal Top Bar */}
            <div className="bg-brand-plum text-white px-6 py-4 flex items-center justify-between border-b border-brand-gold/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-brand-gold text-brand-plum flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-brand-gold">
                    {user?.name} — Biodata
                  </h3>
                  <p className="text-xs text-white/80">{biodata.fileName} • {biodata.fileSize}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={biodata.url || '#'}
                  download={biodata.fileName || 'Biodata.pdf'}
                  className="px-3.5 py-1.5 bg-brand-gold text-brand-plum font-bold text-xs rounded-xl shadow hover:bg-amber-400 flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setShowViewerModal(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Digital Formatted Biodata Document */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-brand-ivory">
              
              {/* Cultural Header Banner */}
              <div className="text-center space-y-2 border-b-2 border-brand-gold pb-6">
                <div className="text-brand-kesari text-sm font-bold font-serif-marathi">
                  ॥ श्री गणेशाय नमः ॥
                </div>
                <h1 className="font-serif text-3xl font-bold text-brand-plum">
                  रेशीमगाठ विवाह बायोडेटा (Biodata)
                </h1>
                <p className="text-xs text-brand-gray">
                  Verified Family Biodata Document • Confidential
                </p>
              </div>

              {/* Profile Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-brand-rose/20 shadow-sm">
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-brand-plum uppercase tracking-wider border-b pb-1">Personal Info</h4>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Full Name:</strong> {user?.name}</p>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Age / DOB:</strong> {user?.age || '26'} Years ({user?.dob || '1998-06-15'})</p>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Height:</strong> {user?.height || '5\' 6"'}</p>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Religion / Caste:</strong> {user?.religion || 'Hindu'} - {user?.caste || 'Maratha'}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-brand-plum uppercase tracking-wider border-b pb-1">Location & Career</h4>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">District:</strong> {user?.district || 'Pune'}</p>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Native Place:</strong> {user?.nativePlace || 'Satara'}</p>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Education:</strong> {user?.education || 'B.E. / B.Tech'}</p>
                  <p className="text-xs text-brand-charcoal"><strong className="text-brand-plum">Occupation:</strong> {user?.occupation || 'Software Engineer'}</p>
                </div>
              </div>

              {/* PDF Preview Frame Container */}
              <div className="bg-white rounded-2xl p-4 border border-brand-rose/20 shadow-md text-center space-y-4">
                <div className="h-96 bg-gray-100 rounded-xl flex flex-col items-center justify-center p-6 space-y-3 border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 text-brand-plum/40" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-brand-plum">{biodata.fileName}</p>
                    <p className="text-[11px] text-brand-gray">Interactive PDF View Mode • {biodata.fileSize}</p>
                  </div>
                  <a
                    href={biodata.url || '#'}
                    download={biodata.fileName || 'Biodata.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-brand-gold" />
                    <span>Open & Download Full PDF</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
