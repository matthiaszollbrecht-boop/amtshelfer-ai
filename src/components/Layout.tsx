import { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showHeader?: boolean;
  headerRight?: ReactNode;
}

export default function Layout({ children, title, showBack = false, showHeader = true, headerRight }: LayoutProps) {
  const { isRTL } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/home';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${isRTL ? 'rtl' : 'ltr'}`}>
      {showHeader && (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showBack && !isHome && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ms-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                >
                  <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
              )}
              {!title && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AH</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">AmtsHelfer AI</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerRight}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      )}
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}
