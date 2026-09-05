import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProfileProvider } from './context/ProfileContext';

import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DiscoverPage } from './pages/DiscoverPage';
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

function AppContent() {
  // Helper to determine initial path & profile id from browser address bar URL slug
  const getInitialRoute = () => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/profile/')) {
      const idStr = pathname.replace('/profile/', '');
      return { path: '/profile', selectedId: idStr || null };
    }
    return { path: pathname === '' ? '/' : pathname, selectedId: null };
  };

  const [currentPath, setCurrentPath] = useState(() => getInitialRoute().path);
  const [selectedProfileId, setSelectedProfileId] = useState(() => getInitialRoute().selectedId);

  // Sync browser back / forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      if (route.selectedId) {
        setSelectedProfileId(route.selectedId);
      }
      setCurrentPath(route.path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Centralized Navigation Function that updates both React state & Browser URL address bar slug
  const handleNavigate = (targetPath) => {
    let cleanPath = targetPath;
    let profId = null;

    // Handle dynamic profile route like /profile/demo_m1
    if (targetPath.startsWith('/profile/')) {
      const idStr = targetPath.replace('/profile/', '');
      if (idStr) {
        profId = idStr;
        cleanPath = '/profile';
      }
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
      case '/discover':
        return <DiscoverPage onNavigate={handleNavigate} />;
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
