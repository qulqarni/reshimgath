import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProfiles } from '../../context/ProfileContext';
import { Home, Search, Heart, MessageSquare, User, LogIn, ShieldCheck, LogOut } from 'lucide-react';

export const MobileBottomNav = ({ currentPath, onNavigate }) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { lang, t } = useLanguage();
  const { totalUnreadMessagesCount } = useProfiles();

  if (isAdmin) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-rose/20 shadow-2xl px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
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
    // { path: '/discover', label: t('discover'), icon: Search },
    { path: '/messages', label: t('messages'), icon: MessageSquare },
    { path: '/interests', label: t('interests'), icon: Heart },
    { 
      path: isAuthenticated ? '/my-profile' : '/login', 
      label: isAuthenticated ? t('myProfile') : (lang === 'mr' ? 'लॉगिन' : 'Login'), 
      icon: isAuthenticated ? User : LogIn 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+6px)]">
      <div className="grid grid-cols-4 items-center text-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all ${
                isActive ? 'text-brand-plum font-bold' : 'text-brand-gray hover:text-brand-charcoal'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 text-brand-plum stroke-[2.5]' : ''}`} />
                {item.path === '/messages' && totalUnreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-sm">
                    {totalUnreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-tight max-w-full px-0.5 ${isActive ? 'font-bold text-brand-plum' : 'font-medium'}`}>
                {item.label}
              </span>
              <div className="h-1 flex items-center justify-center mt-0.5">
                {isActive && <div className="w-1 h-1 bg-brand-kesari rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
