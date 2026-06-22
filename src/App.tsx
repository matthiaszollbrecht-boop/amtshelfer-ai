import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PremiumProvider } from './contexts/PremiumContext';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Reply from './pages/Reply';
import Archive from './pages/Archive';
import Reminders from './pages/Reminders';
import Premium from './pages/Premium';
import Language from './pages/Language';
import Privacy from './pages/Privacy';
import Impressum from './pages/Impressum';
import Terms from './pages/Terms';
import DisclaimerModal from './components/DisclaimerModal';
import { useState } from 'react';

function AppRouter() {
  const { user, isGuest, loading } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(
    () => localStorage.getItem('amtsHelfer_onboarded') === 'true'
  );
  // sessionStorage: disclaimer must be confirmed once per browser session
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    () => sessionStorage.getItem('amtsHelfer_disclaimer_session') === 'true'
  );

  const isLoggedIn = user !== null || isGuest;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={() => {
      localStorage.setItem('amtsHelfer_onboarded', 'true');
      setIsOnboarded(true);
    }} />;
  }

  if (!isLoggedIn) {
    return <Auth />;
  }

  if (!disclaimerAccepted) {
    return (
      <DisclaimerModal onAccept={() => {
        sessionStorage.setItem('amtsHelfer_disclaimer_session', 'true');
        setDisclaimerAccepted(true);
      }} />
    );
  }

  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/analysis/:id" element={<Analysis />} />
      <Route path="/reply" element={<Reply />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/reminders" element={<Reminders />} />
      <Route path="/premium" element={<Premium />} />
      <Route path="/language" element={<Language />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <PremiumProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </PremiumProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
