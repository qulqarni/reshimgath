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
  LayoutDashboard,
  Crown,
  Home,
  Eye,
  Trash2,
  Ban,
  MessageSquareHeart,
  Calendar,
  Images,
  PhoneCall
} from 'lucide-react';

export const Navbar = ({ currentPath, onNavigate }) => {
  const { user, isAuthenticated, logout, loginAsDemo, isAdmin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { profiles, notifications, markNotificationRead, markAllNotificationsRead, totalUnreadMessagesCount, resolveNotificationProfile } = useProfiles();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Close menus when clicking outside
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }
    };
    if (showNavMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNavMenu]);

  const userNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (!user) return true;
      if (n.type === 'view' && String(n.profileId) === String(user.id)) return false;
      if (n.targetUserId && String(n.targetUserId) !== String(user.id) && (user.email ? n.targetUserId !== user.email : true)) return false;
      return true;
    });
  }, [notifications, user?.id, user?.email]);

  const unreadCount = React.useMemo(() => {
    return userNotifications.filter(n => n.unread).length;
  }, [userNotifications]);

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadCount > 0) {
      markAllNotificationsRead(userNotifications.map((n) => n.id));
    }
  };

  const handleNav = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-brand-rose/20 transition-all duration-200 pt-[env(safe-area-inset-top)]">
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
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentPath === '/' 
                      ? 'bg-brand-plum text-white shadow-sm' 
                      : 'text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>{t('home')}</span>
                </button>

                {/* Discover page temporarily commented out
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
                */}

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
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 relative ${
                        currentPath === '/messages' 
                          ? 'bg-brand-plum text-white shadow-sm' 
                          : 'text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{t('messages')}</span>
                      {totalUnreadMessagesCount > 0 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping absolute top-1.5 right-1.5" />
                      )}
                      {totalUnreadMessagesCount > 0 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute top-1.5 right-1.5 border border-white" />
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Language Switcher Button (Visible on both Mobile & Desktop) */}
            <button
              onClick={() => toggleLanguage()}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-brand-gold/40 bg-white/80 text-brand-plum hover:bg-brand-lightBg transition-all text-[11px] sm:text-xs font-semibold shadow-sm shrink-0"
              title="Switch Language / भाषा बदला"
            >
              <Globe className="w-3.5 h-3.5 text-brand-kesari shrink-0" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* 6-OPTION MENU BUTTON (3 lines hamburger icon only) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowNavMenu(!showNavMenu)}
                className={`w-9 h-9 rounded-full border transition-all shadow-sm shrink-0 flex items-center justify-center ${
                  showNavMenu
                    ? 'bg-brand-plum text-white border-brand-plum shadow-md'
                    : 'bg-white border-brand-rose/40 text-brand-plum hover:bg-brand-rose/20'
                }`}
                title="Menu / मेनू"
                aria-label="Menu"
                aria-expanded={showNavMenu}
              >
                <Menu className={`w-5 h-5 ${showNavMenu ? 'text-white' : 'text-brand-plum'}`} />
              </button>

              {/* 6-OPTION MENU DROPDOWN (Strictly in the specified order:
                  1. Success Stories
                  2. Feedbacks
                  3. Upcoming Events
                  4. Gallery
                  5. Contact Us
                  6. Subscription
              ) */}
              {showNavMenu && (
                <div className="absolute right-0 mt-2.5 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-brand-rose/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-plum font-serif">
                      {lang === 'en' ? 'Explore Features' : 'महत्त्वाचे विभाग'}
                    </span>
                    <button
                      onClick={() => setShowNavMenu(false)}
                      className="text-gray-400 hover:text-brand-plum p-0.5 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-1">
                    {/* 1. Success Stories */}
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        handleNav('/stories');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center space-x-3 transition-colors ${
                        currentPath === '/stories' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-lightBg'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Heart className="w-3.5 h-3.5 fill-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-plum">{lang === 'en' ? 'Success Stories' : 'यशस्वी विवाह गाथा'}</p>
                        <p className="text-[10px] text-gray-400 truncate">Happy married couples & journeys</p>
                      </div>
                    </button>

                    {/* 2. Feedbacks */}
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        handleNav('/feedbacks');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center space-x-3 transition-colors ${
                        currentPath === '/feedbacks' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-lightBg'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <MessageSquareHeart className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-plum">{lang === 'en' ? 'Feedbacks' : 'अभिप्राय आणि प्रतिक्रिया'}</p>
                        <p className="text-[10px] text-gray-400 truncate">Member reviews, photos & videos</p>
                      </div>
                    </button>

                    {/* 3. Upcoming Events */}
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        handleNav('/events');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center space-x-3 transition-colors ${
                        currentPath === '/events' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-lightBg'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-plum">{lang === 'en' ? 'Upcoming Events' : 'वधू-वर परिचय मेळावे'}</p>
                        <p className="text-[10px] text-gray-400 truncate">Vadhu-Var Melawas & gatherings</p>
                      </div>
                    </button>

                    {/* 4. Gallery */}
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        handleNav('/gallery');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center space-x-3 transition-colors ${
                        currentPath === '/gallery' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-lightBg'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Images className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-plum">{lang === 'en' ? 'Gallery' : 'फोटो व व्हिडिओ गॅलरी'}</p>
                        <p className="text-[10px] text-gray-400 truncate">Memorable photos & event videos</p>
                      </div>
                    </button>

                    {/* 5. Contact Us */}
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        handleNav('/contact');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center space-x-3 transition-colors ${
                        currentPath === '/contact' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-lightBg'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-plum">{lang === 'en' ? 'Contact Us' : 'संपर्क व पत्ता'}</p>
                        <p className="text-[10px] text-gray-400 truncate">+91 9823425404 • Ichalkaranji</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* 6. Subscription */}
                    <button
                      onClick={() => {
                        setShowNavMenu(false);
                        handleNav('/subscription');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center space-x-3 transition-colors bg-amber-50/70 hover:bg-amber-100/80 ${
                        currentPath === '/subscription' ? 'ring-1 ring-amber-400' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                        <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-amber-950">{lang === 'en' ? 'Subscription' : 'वर्गणी व योजना'}</p>
                        <p className="text-[10px] text-amber-800 truncate">
                          {user?.subscription?.planName && isAuthenticated && !isAdmin
                            ? `${user.subscription.planName} (${user.subscription.creditsRemaining || 0} Credits Left)`
                            : 'View membership plans & rates'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                
                {/* Notification Dropdown (Mobile & Desktop) */}
                {!isAdmin && (
                  <div className="relative">
                    <button
                      onClick={handleToggleNotifications}
                      className="p-2 rounded-full text-brand-charcoal hover:bg-brand-lightBg hover:text-brand-plum relative transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5 text-brand-plum" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-brand-kesari text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Center Popover */}
                    {showNotifications && (
                      <div className="fixed top-16 left-3 right-3 sm:absolute sm:inset-auto sm:right-0 sm:mt-3 sm:w-96 bg-white rounded-2xl shadow-2xl border border-brand-rose/30 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-serif font-bold text-brand-plum text-base">Notifications</h4>
                          <span className="text-xs bg-brand-rose/20 text-brand-plum px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} unread
                          </span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                          {userNotifications.length === 0 ? (
                            <p className="p-4 text-xs text-brand-gray text-center">No notifications yet.</p>
                          ) : (
                            userNotifications.map((n) => {
                              const targetPerson = resolveNotificationProfile ? resolveNotificationProfile(n, profiles) : null;
                              const targetSlug = targetPerson?.regId 
                                || (targetPerson?.registrationId ? `SS-${targetPerson.registrationId}` : null) 
                                || targetPerson?.id 
                                || n.profileId 
                                || n.senderId 
                                || n.visitorId;
                              const isProfileVisit = n.type === 'view' || (n.title && n.title.toLowerCase().includes('visit')) || (n.title && n.title.toLowerCase().includes('view'));
                              const isInterest = n.type === 'interest' || (n.title && n.title.toLowerCase().includes('interest') && !n.title.toLowerCase().includes('accepted'));

                              return (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    markNotificationRead(n.id);
                                    setShowNotifications(false);
                                    if (n.type === 'message') {
                                      const chatPartnerId = n.senderId || n.profileId || targetSlug;
                                      if (chatPartnerId) {
                                        try {
                                          sessionStorage.setItem('reshimgath_target_chat', chatPartnerId);
                                        } catch (e) {}
                                      }
                                      handleNav('/messages');
                                      return;
                                    }
                                    if ((isProfileVisit || isInterest) && targetSlug) {
                                      handleNav(`/profile/${targetSlug}`);
                                      return;
                                    }
                                    if (n.type === 'accepted') {
                                      handleNav('/messages');
                                      return;
                                    }
                                    if (n.type === 'interest') {
                                      handleNav('/interests');
                                      return;
                                    }
                                    if (targetSlug) {
                                      handleNav(`/profile/${targetSlug}`);
                                      return;
                                    }
                                  }}
                                  className={`p-3.5 hover:bg-brand-ivory cursor-pointer transition-colors flex items-start space-x-3 ${
                                    n.unread ? 'bg-brand-rose/10' : ''
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center shrink-0 mt-0.5">
                                    {n.type === 'view' || isProfileVisit ? (
                                      <Eye className="w-4 h-4 text-blue-600" />
                                    ) : n.type === 'interest' || isInterest ? (
                                      <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
                                    ) : n.type === 'message' ? (
                                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 text-brand-kesari" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-brand-charcoal">{n.title}</p>
                                    <p className="text-xs text-brand-gray mt-0.5">{n.text}</p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        {userNotifications.length > 0 && (
                          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70 text-center rounded-b-2xl">
                            <button
                              onClick={() => {
                                setShowNotifications(false);
                                handleNav('/notifications');
                              }}
                              className="text-[11px] font-bold text-brand-plum hover:text-brand-plumDark transition-colors"
                            >
                              View all notifications →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* User Avatar Dropdown (Desktop Only) */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-plum bg-white shadow-sm hover:shadow transition-all"
                  >
                    {isAdmin ? (
                      <div className="w-7 h-7 rounded-full bg-brand-plum text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-brand-gold" />
                      </div>
                    ) : (
                      <img
                        src={user?.avatar || user?.photos?.[0] || '/default-avatar.png'}
                        alt={user?.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-100"
                      />
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

                          <button
                            onClick={() => handleNav('/blocked-users')}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand-charcoal hover:bg-brand-lightBg flex items-center space-x-2"
                          >
                            <Ban className="w-4 h-4 text-rose-500" />
                            <span>Blocked Profiles</span>
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
            {/* Discover page temporarily commented out
            <button
              onClick={() => handleNav('/discover')}
              className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl"
            >
              {t('discover')}
            </button>
            */}
            {/* The 6 Core Navigation Sections in Required Order */}
            <div className="py-2 border-y border-brand-rose/20 my-1 space-y-1">
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-brand-plum/70 block">
                {lang === 'en' ? 'Quick Menu' : 'मुख्य विभाग'}
              </span>

              {/* 1. Success Stories */}
              <button
                onClick={() => handleNav('/stories')}
                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2.5 ${
                  currentPath === '/stories' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-ivory'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 shrink-0" />
                <span>{lang === 'en' ? '1. Success Stories' : '१. यशस्वी विवाह गाथा'}</span>
              </button>

              {/* 2. Feedbacks */}
              <button
                onClick={() => handleNav('/feedbacks')}
                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2.5 ${
                  currentPath === '/feedbacks' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-ivory'
                }`}
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{lang === 'en' ? '2. Feedbacks' : '२. अभिप्राय आणि प्रतिक्रिया'}</span>
              </button>

              {/* 3. Upcoming Events */}
              <button
                onClick={() => handleNav('/events')}
                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2.5 ${
                  currentPath === '/events' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-ivory'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{lang === 'en' ? '3. Upcoming Events' : '३. वधू-वर परिचय मेळावे'}</span>
              </button>

              {/* 4. Gallery */}
              <button
                onClick={() => handleNav('/gallery')}
                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2.5 ${
                  currentPath === '/gallery' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-ivory'
                }`}
              >
                <Images className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? '4. Gallery' : '४. फोटो व व्हिडिओ गॅलरी'}</span>
              </button>

              {/* 5. Contact Us */}
              <button
                onClick={() => handleNav('/contact')}
                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2.5 ${
                  currentPath === '/contact' ? 'bg-brand-rose/20 text-brand-plum' : 'text-brand-charcoal hover:bg-brand-ivory'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{lang === 'en' ? '5. Contact Us' : '५. संपर्क व पत्ता'}</span>
              </button>

              {/* 6. Subscription */}
              <button
                onClick={() => handleNav('/subscription')}
                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2.5 bg-amber-50 text-amber-950 border border-amber-200 ${
                  currentPath === '/subscription' ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                <span>{lang === 'en' ? '6. Subscription Plans' : '६. वर्गणी व योजना'}</span>
              </button>
            </div>

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
                  onClick={() => handleNav('/settings')}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-gray shrink-0" />
                    <span>{t('settings')}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNav('/blocked-users')}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-ivory rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Ban className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Blocked Profiles</span>
                  </div>
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
