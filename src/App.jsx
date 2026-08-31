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
import { DashboardPage } from './pages/DashboardPage';
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

function AppContent() {
  // Helper to determine initial path from browser address bar URL slug
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname;
    if (path.startsWith('/profile/')) return '/profile';
    return path || '/';
  };

  const getInitialProfileId = () => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/profile/')) return path.replace('/profile/', '');
    return null;
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [selectedProfileId, setSelectedProfileId] = useState(getInitialProfileId);

  // Sync browser back & forward button navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/profile/')) {
        setSelectedProfileId(path.replace('/profile/', ''));
        setCurrentPath('/profile');
      } else {
        setSelectedProfileId(null);
        setCurrentPath(path || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath, selectedProfileId]);

  // Handle URL Slug Navigation with HTML5 History API
  const handleNavigate = (path) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    if (path.startsWith('/profile/')) {
      const id = path.replace('/profile/', '');
      setSelectedProfileId(id);
      setCurrentPath('/profile');
    } else {
      setSelectedProfileId(null);
      setCurrentPath(path);
    }
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
      case '/dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case '/discover':
        return <DiscoverPage onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfileDetailPage profileId={selectedProfileId} onNavigate={handleNavigate} />;
      case '/my-profile':
      case '/edit-profile':
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
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-ivory text-brand-charcoal">
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />
      <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
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
