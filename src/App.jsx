import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProfileProvider, useProfiles } from './context/ProfileContext';

import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
// import { DiscoverPage } from './pages/DiscoverPage';
import { ProfileDetailPage } from './pages/ProfileDetailPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { InterestsPage } from './pages/InterestsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';

function AppContent() {
  const { subModalConfig, closeSubscriptionModal } = useProfiles();

  // Helper to determine initial path & profile id from browser address bar URL slug, query params, or hash
  const getInitialRoute = () => {
    const pathname = window.location.pathname || '';
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    // 1. Direct /profile/:id in pathname
    if (pathname.startsWith('/profile/')) {
      const idStr = pathname.replace('/profile/', '').split('/')[0].split('?')[0];
      return { path: '/profile', selectedId: idStr || null };
    }

    // 2. Query parameters (e.g. ?profileId=p_123 or ?route=/profile/p_123 or ?page=interests)
    try {
      const urlParams = new URLSearchParams(search);
      const profId = urlParams.get('profileId') || urlParams.get('profile') || urlParams.get('targetProfileId') || urlParams.get('id');
      if (profId) {
        return { path: '/profile', selectedId: profId };
      }
      const routeParam = urlParams.get('route') || urlParams.get('path');
      if (routeParam) {
        if (routeParam.startsWith('/profile/')) {
          const idStr = routeParam.replace('/profile/', '').split('/')[0].split('?')[0];
          return { path: '/profile', selectedId: idStr || null };
        }
        return { path: routeParam, selectedId: null };
      }
      const pageParam = urlParams.get('page') || urlParams.get('screen');
      if (pageParam === 'interests') return { path: '/interests', selectedId: null };
      if (pageParam === 'messages') return { path: '/messages', selectedId: null };
      if (pageParam === 'notifications') return { path: '/notifications', selectedId: null };
    } catch (e) {}

    // 3. Hash-based routing e.g. #/profile/p_123 or #/interests
    if (hash.startsWith('#/profile/')) {
      const idStr = hash.replace('#/profile/', '').split('/')[0].split('?')[0];
      return { path: '/profile', selectedId: idStr || null };
    }
    if (hash.startsWith('#/')) {
      const cleanHash = hash.replace('#', '').split('?')[0];
      return { path: cleanHash, selectedId: null };
    }

    return { path: pathname === '' ? '/' : pathname, selectedId: null };
  };

  const [currentPath, setCurrentPath] = useState(() => getInitialRoute().path);
  const [selectedProfileId, setSelectedProfileId] = useState(() => getInitialRoute().selectedId);

  // Sync browser back / forward buttons (popstate) & hash changes & notification deep links
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      if (route.selectedId) {
        setSelectedProfileId(route.selectedId);
      }
      setCurrentPath(route.path);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Global listener for custom notification navigation events
    const handleNotificationNav = (event) => {
      const data = event?.detail || event?.data;
      if (!data) return;
      if (typeof data === 'string') {
        handleNavigate(data);
        return;
      }
      const targetRoute = data.route || data.path || (data.profileId ? `/profile/${data.profileId}` : null);
      if (targetRoute) {
        handleNavigate(targetRoute);
      }
    };
    window.addEventListener('notification_navigation', handleNotificationNav);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('notification_navigation', handleNotificationNav);
    };
  }, []);

  // Centralized Navigation Function that updates both React state & Browser URL address bar slug
  const handleNavigate = (targetPath) => {
    let cleanPath = targetPath;
    let profId = null;

    // Handle dynamic profile route like /profile/demo_m1 or /profile?id=demo_m1
    if (targetPath.startsWith('/profile/')) {
      const idStr = targetPath.replace('/profile/', '').split('?')[0];
      if (idStr) {
        profId = idStr;
        cleanPath = '/profile';
      }
    } else if (targetPath.startsWith('/profile?')) {
      try {
        const params = new URLSearchParams(targetPath.split('?')[1]);
        const idStr = params.get('id') || params.get('profileId');
        if (idStr) {
          profId = idStr;
          cleanPath = '/profile';
        }
      } catch (e) {}
    }

    if (profId !== null) {
      setSelectedProfileId(profId);
    }

    // Redirect dashboard requests directly to my-profile
    const pushUrl = targetPath === '/dashboard' ? '/my-profile' : targetPath;

    // Update browser URL address bar dynamically without full page reload
    if (window.location.pathname !== pushUrl) {
      window.history.pushState({}, '', pushUrl);
    }

    setCurrentPath(cleanPath === '/dashboard' ? '/my-profile' : cleanPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={handleNavigate} />;
      case '/login':
        return <LoginPage onNavigate={handleNavigate} />;
      case '/signup':
        return <SignUpPage onNavigate={handleNavigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case '/reset-password':
        return <ResetPasswordPage onNavigate={handleNavigate} />;
      case '/profile-setup':
        return <ProfileSetupPage onNavigate={handleNavigate} />;
      // case '/discover':
      //   return <DiscoverPage onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfileDetailPage profileId={selectedProfileId} onNavigate={handleNavigate} />;
      case '/my-profile':
      case '/edit-profile':
      case '/dashboard':
        return <MyProfilePage onNavigate={handleNavigate} />;
      case '/interests':
        return <InterestsPage onNavigate={handleNavigate} />;
      case '/messages':
        return <MessagesPage onNavigate={handleNavigate} />;
      case '/notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case '/settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case '/about':
        return <AboutPage onNavigate={handleNavigate} />;
      case '/contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case '/privacy-policy':
      case '/privacy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case '/terms-of-service':
      case '/terms':
        return <TermsOfServicePage onNavigate={handleNavigate} />;
      case '/admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-lightBg flex flex-col font-sans text-brand-charcoal selection:bg-brand-plum selection:text-white">
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      <main className="flex-1 pb-16 md:pb-0">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />
      <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />
      <ToastContainer />
      <SubscriptionModal
        isOpen={Boolean(subModalConfig?.isOpen)}
        onClose={closeSubscriptionModal}
        targetProfileName={subModalConfig?.targetProfileName}
        reason={subModalConfig?.reason}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
