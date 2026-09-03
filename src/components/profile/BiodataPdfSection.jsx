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
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove your uploaded Biodata?')) {
      updateProfile({ biodataPdf: null });
    }
  };

  if (!isEditable && !biodata) {
    return null;
  }

  const isBiodataImage = biodata?.fileType === 'image' || biodata?.url?.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(biodata?.fileName || '');

  return (
    <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      {uploadSuccess && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold border border-emerald-200 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Biodata Uploaded Successfully!</span>
        </div>
      )}

      {/* Main Content Area */}
      {biodata ? (
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* File Info */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {isBiodataImage ? 'IMG' : 'PDF'}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {biodata.fileName}
                </h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                  <span>{biodata.fileSize}</span>
                  <span>•</span>
                  <span>Uploaded {biodata.uploadedAt}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowViewerModal(true)}
                className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-slate-800 transition-all flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>View</span>
              </button>

              <a
                href={biodata.url || '#'}
                download={biodata.fileName || 'Biodata'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Download</span>
              </a>

              {isEditable && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-1.5 bg-amber-50/80 text-amber-900 border border-amber-300/70 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all flex items-center space-x-1.5"
                    title="Upload New Biodata"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Remove Biodata"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Clean Neutral Drag & Drop Box */
        <div 
          onClick={() => isEditable && fileInputRef.current?.click()}
          className={`border border-dashed border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50/60 rounded-xl p-5 text-center transition-all cursor-pointer ${
            isUploading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="max-w-xs mx-auto space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto">
              <UploadCloud className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-slate-800">
                {isUploading ? 'Uploading Biodata...' : 'Click to Upload Biodata'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PDF or Image format (JPG, PNG, WEBP) up to 10MB
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-block px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-slate-800 transition-all">
                Select File (PDF / Image)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN BIODATA VIEWER MODAL */}
      {showViewerModal && biodata && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-200">
            
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <FileCheck className="w-5 h-5 text-slate-950 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base text-white truncate">
                    {user?.name} — Biodata
                  </h3>
                  <p className="text-xs text-slate-300 truncate">{biodata.fileName} • {biodata.fileSize}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <a
                  href={biodata.url || '#'}
                  download={biodata.fileName || 'Biodata'}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Download File</span>
                  <span className="sm:hidden">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowViewerModal(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Digital Formatted Biodata Document */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-100">
              
              {/* Cultural Header Banner */}
              <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
                <div className="text-amber-600 text-xs font-bold font-serif-marathi tracking-widest">
                  ॥ श्री गणेशाय नमः ॥
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  बायोडेटा दस्तावेज (Biodata)
                </h1>
                <p className="text-xs text-slate-500">
                  Verified Family Biodata Document • Confidential
                </p>
              </div>

              {/* Profile Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">Personal Info</h4>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Full Name:</strong> {user?.name}</p>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Age / DOB:</strong> {user?.age || '26'} Years ({user?.dob || '1998-06-15'})</p>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Height:</strong> {user?.height || '5\' 6"'}</p>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Religion / Caste:</strong> {user?.religion || 'Hindu'} - {user?.caste || 'Maratha'}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">Location & Career</h4>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">District:</strong> {user?.district || 'Pune'}</p>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Native Place:</strong> {user?.nativePlace || 'Satara'}</p>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Education:</strong> {user?.education || 'B.E. / B.Tech'}</p>
                  <p className="text-xs text-slate-700"><strong className="text-slate-900">Occupation:</strong> {user?.occupation || 'Software Engineer'}</p>
                </div>
              </div>

              {/* Preview Frame Container (Image vs PDF) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center space-y-4">
                {isBiodataImage ? (
                  <div className="flex flex-col items-center justify-center p-2 space-y-3">
                    <img 
                      src={biodata.url} 
                      alt="Biodata Document" 
                      className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-md border border-slate-200"
                    />
                    <a
                      href={biodata.url || '#'}
                      download={biodata.fileName || 'Biodata'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-slate-800 transition-all flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Download High Resolution Image</span>
                    </a>
                  </div>
                ) : (
                  <div className="h-80 sm:h-96 bg-slate-50 rounded-xl flex flex-col items-center justify-center p-6 space-y-3 border border-dashed border-slate-300">
                    <FileText className="w-14 h-14 text-slate-400" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">{biodata.fileName}</p>
                      <p className="text-[11px] text-slate-500">Interactive PDF View Mode • {biodata.fileSize}</p>
                    </div>
                    <a
                      href={biodata.url || '#'}
                      download={biodata.fileName || 'Biodata.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-slate-800 transition-all flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Open & Download Full PDF</span>
                    </a>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
