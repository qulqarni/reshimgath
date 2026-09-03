import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Search, Heart, MessageSquare, User, LogIn, ShieldCheck, LogOut } from 'lucide-react';

export const MobileBottomNav = ({ currentPath, onNavigate }) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { lang, t } = useLanguage();

  if (isAdmin) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-rose/20 shadow-2xl px-4 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onNavigate('/admin')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentPath === '/admin' ? 'text-brand-plum font-bold' : 'text-brand-gray'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-brand-kesari" />
            <span className="text-[10px] mt-1 font-bold">Admin Panel</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentPath === '/' ? 'text-brand-plum font-bold' : 'text-brand-gray'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Main Site</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('/admin');
            }}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-rose-600 font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/discover', label: t('discover'), icon: Search },
    { path: '/messages', label: t('messages'), icon: MessageSquare, isHighlight: true },
    { path: '/interests', label: t('interests'), icon: Heart },
    { 
      path: isAuthenticated ? '/my-profile' : '/login', 
      label: isAuthenticated ? t('myProfile') : (lang === 'mr' ? 'लॉगिन' : 'Login'), 
      icon: isAuthenticated ? User : LogIn 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-rose/20 shadow-2xl px-2 pb-1.5 pt-1">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          if (item.isHighlight) {
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
              >
                <div className={`w-11 h-11 rounded-full bg-gradient-to-tr from-brand-plum via-purple-950 to-brand-plum text-brand-gold flex items-center justify-center shadow-lg border-2 border-brand-gold transition-all group-hover:scale-105 active:scale-95 ${
                  isActive ? 'ring-4 ring-brand-kesari/40 scale-105' : ''
                }`}>
                  <Icon className="w-5 h-5 text-brand-gold fill-brand-gold/25 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] mt-1 font-bold truncate max-w-[64px] ${
                  isActive ? 'text-brand-plum font-extrabold' : 'text-brand-charcoal'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-brand-plum font-bold' : 'text-brand-gray hover:text-brand-charcoal'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-brand-plum stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-1 font-medium truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-brand-kesari rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
