import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProfiles } from '../../context/ProfileContext';
import { 
  Heart, 
  Search, 
  MessageSquare, 
  User, 
  Globe, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  CheckCircle,
  LayoutDashboard
} from 'lucide-react';

export const Navbar = ({ currentPath, onNavigate }) => {
  const { user, isAuthenticated, logout, loginAsDemo, isAdmin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { notifications, markNotificationRead } = useProfiles();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userNotifications = notifications.filter((n) => {
    if (!user) return true;
    if (n.type === 'view' && String(n.profileId) === String(user.id)) return false;
    if (n.targetUserId && String(n.targetUserId) !== String(user.id) && (user.email ? n.targetUserId !== user.email : true)) return false;
    return true;
  });

  const unreadCount = userNotifications.filter(n => n.unread).length;

  const handleNav = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-brand-rose/20 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Brand (Left) */}
          <div 
            onClick={() => handleNav(isAdmin ? '/admin' : '/')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink"
          >
            <img 
              src="/logo.png" 
              alt="Sambodhi Sarang Marriage Bureau" 
              className="h-12 sm:h-16 md:h-18 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {isAdmin ? (
              <button
                onClick={() => handleNav('/admin')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  currentPath === '/admin' 
                    ? 'bg-brand-plum text-white shadow-sm' 
                    : 'bg-brand-plum/10 text-brand-plum hover:bg-brand-plum/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-brand-kesari" />
                <span>Administrator Control Panel</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentPath === '/' 
                      ? 'bg-brand-plum text-white shadow-sm' 
                      : 'text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum'
                  }`}
                >
                  {t('home')}
                </button>

                <button
                  onClick={() => handleNav('/discover')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentPath === '/discover' 
                      ? 'bg-brand-plum text-white shadow-sm' 
                      : 'text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>{t('discover')}</span>
                </button>

                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => handleNav('/interests')}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                        currentPath === '/interests' 
                          ? 'bg-brand-plum text-white shadow-sm' 
                          : 'text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{t('interests')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('/messages')}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                        currentPath === '/messages' 
                          ? 'bg-brand-plum text-white shadow-sm' 
                          : 'text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{t('messages')}</span>
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Switcher Button (Visible on both Mobile & Desktop) */}
            <button
              onClick={() => toggleLanguage()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-brand-gold/40 bg-white/80 text-brand-plum hover:bg-brand-lightBg transition-all text-xs font-semibold shadow-sm"
              title="Switch Language / भाषा बदला"
            >
              <Globe className="w-3.5 h-3.5 text-brand-kesari" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                
                {/* Notification Dropdown (Desktop Only) */}
                {!isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-full text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum relative transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-brand-kesari text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Center Popover */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-brand-rose/30 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-serif font-bold text-brand-plum text-base">Notifications</h4>
                          <span className="text-xs bg-brand-rose/20 text-brand-plum px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} unread
                          </span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                          {userNotifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.type === 'interest') handleNav('/interests');
                                if (n.type === 'accepted') handleNav('/messages');
                              }}
                              className={`p-3.5 hover:bg-brand-ivory cursor-pointer transition-colors flex items-start space-x-3 ${
                                n.unread ? 'bg-brand-rose/10' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center shrink-0 mt-0.5">
                                {n.type === 'interest' ? <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" /> : <CheckCircle className="w-4 h-4 text-brand-kesari" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-brand-charcoal">{n.title}</p>
                                <p className="text-xs text-brand-gray mt-0.5">{n.text}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-plum bg-white shadow-sm hover:shadow transition-all"
                  >
                    {isAdmin ? (
                      <div className="w-7 h-7 rounded-full bg-brand-plum text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-brand-gold" />
                      </div>
                    ) : (user?.avatar || user?.photos?.[0]) ? (
                      <img
                        src={user.avatar || user.photos[0]}
                        alt={user?.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-plum text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden lg:block text-xs font-bold text-brand-charcoal max-w-[100px] truncate">
                      {isAdmin ? 'Bureau Admin' : user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-brand-rose/30 py-2 z-50">
                      {isAdmin ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-bold text-brand-plum">Bureau Administrator</p>
                            <p className="text-xs text-brand-kesari font-semibold">System Administrator</p>
                          </div>

                          <button
                            onClick={() => handleNav('/admin')}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand-charcoal hover:bg-brand-lightBg flex items-center space-x-2"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-plum" />
                            <span>Admin Dashboard</span>
                          </button>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={() => {
                              logout();
                              handleNav('/admin');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout Admin</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-bold text-brand-plum">{user?.name}</p>
                            <p className="text-xs text-brand-gray">{user?.district || 'Pune'}, Maharashtra</p>
                          </div>

                          <button
                            onClick={() => handleNav('/my-profile')}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand-charcoal hover:bg-brand-lightBg flex items-center space-x-2"
                          >
                            <User className="w-4 h-4 text-brand-plum" />
                            <span>{t('myProfile')}</span>
                          </button>

                          <button
                            onClick={() => handleNav('/settings')}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand-charcoal hover:bg-brand-lightBg flex items-center space-x-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-brand-gray" />
                            <span>{t('settings')}</span>
                          </button>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={() => {
                              logout();
                              handleNav('/');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('logout')}</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest Auth CTAs (Desktop Only) */
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-xs font-semibold text-brand-plum hover:text-brand-kesari transition-colors"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="px-4 py-2 text-xs font-bold bg-brand-plum text-white rounded-xl shadow-md hover:bg-brand-plumDark transition-all border border-brand-gold/30"
                >
                  {t('signup')}
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-brand-rose/20 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNav('/')}
              className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
            >
              {t('home')}
            </button>
            <button
              onClick={() => handleNav('/discover')}
              className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
            >
              {t('discover')}
            </button>
            <button
              onClick={() => handleNav('/about')}
              className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
            >
              {t('aboutUs')}
            </button>
            <button
              onClick={() => handleNav('/contact')}
              className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
            >
              {t('contactUs')}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('/interests')}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
                >
                  {t('interests')}
                </button>
                <button
                  onClick={() => handleNav('/messages')}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
                >
                  {t('messages')}
                </button>

                <button
                  onClick={() => handleNav('/my-profile')}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
                >
                  {t('myProfile')}
                </button>
                <button
                  onClick={() => {
                    logout();
                    handleNav('/');
                  }}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2.5 text-center text-sm font-bold text-brand-plum border border-brand-plum rounded-xl"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="w-full py-2.5 text-center text-sm font-bold bg-brand-plum text-white rounded-xl shadow"
                >
                  {t('signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
