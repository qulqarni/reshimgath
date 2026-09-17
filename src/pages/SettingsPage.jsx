import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Lock, Eye, Bell, Trash2, CheckCircle2 } from 'lucide-react';

export const SettingsPage = ({ onNavigate }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const [hidePhone, setHidePhone] = useState(true);
  const [hidePhoto, setHidePhoto] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-plum/10 text-brand-plum flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-brand-plum" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-plum">Account & Privacy Settings</h1>
          <p className="text-xs text-brand-gray">Control profile privacy, phone number visibility, and safety options.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-6">
        
        {/* Privacy Section */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-plum border-b pb-2">Profile Privacy Controls</h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-xs">
            <div>
              <h4 className="font-bold text-brand-charcoal">Hide Phone Number from Public</h4>
              <p className="text-brand-gray text-[11px] mt-0.5">Phone number is shared exclusively after interest is accepted by both partners.</p>
            </div>
            <input
              type="checkbox"
              checked={hidePhone}
              onChange={(e) => setHidePhone(e.target.checked)}
              className="rounded text-brand-plum focus:ring-brand-plum w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-xs">
            <div>
              <h4 className="font-bold text-brand-charcoal">Hide Photos from Non-Registered Visitors</h4>
              <p className="text-brand-gray text-[11px] mt-0.5">Photos will only be visible to logged-in verified members.</p>
            </div>
            <input
              type="checkbox"
              checked={hidePhoto}
              onChange={(e) => setHidePhoto(e.target.checked)}
              className="rounded text-brand-plum focus:ring-brand-plum w-5 h-5"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {saved ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </span>
          ) : <div />}

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all"
          >
            Save Privacy Settings
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-rose-100 space-y-3">
          <h4 className="font-bold text-xs text-rose-700">Danger Zone</h4>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete your profile?")) {
                logout();
                onNavigate('/');
              }
            }}
            className="px-4 py-2 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 hover:bg-rose-100 flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete my Sambodhi Sarang Account</span>
          </button>
        </div>

      </div>
    </div>
  );
};
