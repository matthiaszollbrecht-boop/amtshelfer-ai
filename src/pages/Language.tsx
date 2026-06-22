import { useI18n } from '../i18n';
import { LANGUAGES } from '../i18n/types';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import { Check, Globe } from 'lucide-react';

export default function Language() {
  const { t, language, setLanguage } = useI18n();

  return (
    <>
      <Layout title={t('home.changeLanguage')} showBack>
        <div className="py-4 space-y-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${language === lang.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'}`}
            >
              <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{lang.nativeName}</p>
                <p className="text-xs text-gray-400">{lang.name}</p>
              </div>
              {language === lang.code && (
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
              {lang.rtl && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">RTL</span>
              )}
            </button>
          ))}
        </div>
      </Layout>
      <BottomNav />
    </>
  );
}
