import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login, loginAsDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = email.trim();
    if (!cleanId || !password) {
      setError('Please enter your registered email/phone and password.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(cleanId, password);
      if (result && result.success) {
        let redirectPath = null;
        try {
          redirectPath = sessionStorage.getItem('reshimgath_redirect_after_auth');
          if (redirectPath) {
            sessionStorage.removeItem('reshimgath_redirect_after_auth');
          }
        } catch (e) {}

        React.startTransition(() => {
          onNavigate(redirectPath || '/');
        });
      } else {
        setError(result?.message || 'Account not found. Please check your login credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and internet connection.');
    } finally {
      setIsSubmitting(false);
    }
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



        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Email / Mobile Number / Registration ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email, Mobile, or Reg ID (e.g., SS-1001)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs transition-colors"
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
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-2 focus:ring-brand-plum/20 text-xs transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-brand-plum"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !password}
            className="w-full py-3.5 bg-brand-plum hover:bg-brand-plumDark disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all border border-brand-gold/30 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>{t('login')}</span>
            )}
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
