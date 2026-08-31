import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login, loginAsDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide valid login details');
      return;
    }
    login(email, password);
    onNavigate('/discover');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-brand-rose/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <img 
            src="/logo.png" 
            alt="Sambodhi Sarang Marriage Bureau" 
            className="h-16 w-auto object-contain mx-auto" 
          />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            {t('loginHeading')}
          </h2>
          <p className="text-xs text-brand-gray">
            {t('loginSubheading')}
          </p>
        </div>

        {/* Instant Demo Login Callout */}
        <div className="bg-amber-50 border border-amber-300/80 p-4 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-brand-kesari" />
            <span>Instant Live Demo Access</span>
          </div>
          <p className="text-[11px] text-amber-800">
            {t('demoUserNotice')}
          </p>
          <button
            type="button"
            onClick={() => {
              loginAsDemo();
              onNavigate('/discover');
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-brand-kesari to-amber-600 text-white font-bold text-xs rounded-xl shadow hover:opacity-95 transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('demoUserBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Email / Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya.kulkarni@reshimgath.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-brand-charcoal">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-[11px] font-semibold text-brand-plum hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-plumDark transition-all border border-brand-gold/30"
          >
            {t('login')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-brand-gray">
            Don't have a profile yet?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="font-bold text-brand-plum hover:underline"
            >
              {t('signup')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
