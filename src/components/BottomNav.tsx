import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { Scan, FileText, Archive, Globe, Crown } from 'lucide-react';

export default function BottomNav() {
  const { t, isRTL } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { path: '/home', icon: Scan, label: t('home.scanLetter') },
    { path: '/upload', icon: FileText, label: t('upload.title') },
    { path: '/archive', icon: Archive, label: t('home.archive') },
    { path: '/language', icon: Globe, label: t('home.changeLanguage') },
    { path: '/premium', icon: Crown, label: t('home.premium') },
  ];

  return (
    <nav className={`fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {items.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0 flex-1
                ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight truncate w-full text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
