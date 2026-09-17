import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lock, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-brand-plum">
            Set New Password
          </h2>
          <p className="text-xs text-brand-gray">
            Create a strong new password for your Sambodhi Sarang account.
          </p>
        </div>

        {done ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-base text-emerald-900">Password Updated Successfully!</h4>
            <p className="text-xs text-emerald-800">
              You can now log in with your new password.
            </p>
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
            >
              Proceed to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
