import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-2xl">
        <button
          onClick={() => onNavigate('/login')}
          className="flex items-center space-x-1.5 text-xs text-brand-gray hover:text-brand-plum font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-brand-plum">
            {t('forgotPassHeading')}
          </h2>
          <p className="text-xs text-brand-gray">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-900">Reset Link Sent</h4>
            <p className="text-xs text-emerald-800">
              We have dispatched a password recovery email to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => onNavigate('/reset-password')}
              className="w-full py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Simulate Opening Password Reset Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@reshimgath.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all"
            >
              Send Reset Instructions
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
