import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../contexts/PremiumContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { Scan, FileUp, Archive, Crown, Bell, FileText, LogOut, Shield, Building2, ScrollText, Trash2 } from 'lucide-react';
import { ArchivedDocument, Reminder } from '../lib/store';
import { getDocuments, getReminders } from '../lib/db';

export default function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const { isPremium, analysesUsed, analysesLimit } = usePremium();

  const [documents, setDocuments] = useState<ArchivedDocument[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user || isGuest) return;
    getDocuments(user.id).then(setDocuments).catch(console.error);
    getReminders(user.id).then(setReminders).catch(console.error);
  }, [user, isGuest]);

  const urgentReminders = reminders.filter(r => r.riskLevel === 'red' || r.daysLeft <= 7);

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.email ? user.email.split('@')[0] : (isGuest ? 'Gast' : '');

  return (
    <>
      <Layout showHeader>
        <div className="space-y-6">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('home.greeting')}{displayName ? `, ${displayName}` : ''}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('app.tagline')}</p>
            </div>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <button
                  onClick={() => navigate('/premium')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs font-bold shadow-sm"
                >
                  <Crown className="w-3.5 h-3.5" />
                  {t('premium.premiumPlan')}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/premium')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                  {t('premium.upgrade')}
                </button>
              )}
            </div>
          </div>

          {/* Usage bar for free users */}
          {!isPremium && (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('premium.analysesMonth')}
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {analysesUsed}/{analysesLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${analysesUsed >= analysesLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min((analysesUsed / analysesLimit) * 100, 100)}%` }}
                />
              </div>
              {analysesUsed >= analysesLimit && (
                <p className="text-xs text-red-500 mt-1.5">
                  {t('premium.limitReached')} — <button onClick={() => navigate('/premium')} className="underline font-medium">{t('premium.unlockPremium')}</button>
                </p>
              )}
            </div>
          )}

          {/* Urgent Reminders */}
          {urgentReminders.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {urgentReminders.length} {urgentReminders.length === 1 ? t('premium.urgentDeadline') : t('premium.urgentDeadlines')}
                </span>
              </div>
              {urgentReminders.slice(0, 2).map(r => (
                <p key={r.id} className="text-xs text-red-600 dark:text-red-400 ml-6">
                  {r.documentTitle} — {r.daysLeft} {t('reminders.daysLeft')}
                </p>
              ))}
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="flex flex-col items-center gap-3 p-5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <Scan className="w-7 h-7" />
              <span className="text-sm font-medium">{t('home.scanLetter')}</span>
            </button>
            <button
              onClick={() => navigate('/upload?type=pdf')}
              className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]"
            >
              <FileUp className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">{t('home.uploadPdf')}</span>
            </button>
            <button
              onClick={() => navigate('/archive')}
              className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]"
            >
              <Archive className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">{t('home.archive')}</span>
            </button>
            <button
              onClick={() => navigate('/reminders')}
              className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]"
            >
              <Bell className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">{t('reminders.title')}</span>
            </button>
          </div>

          {/* Recent Documents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('home.recentDocs')}</h3>
              <button onClick={() => navigate('/archive')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                {t('home.archive')} →
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('home.noDocs')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 3).map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => navigate(`/analysis/${doc.id}`)}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-start"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{doc.date}</p>
                    </div>
                    <RiskBadge level={doc.riskLevel} showLabel={false} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <button
              onClick={() => navigate('/privacy')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              {t('privacy.title')}
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ScrollText className="w-3.5 h-3.5" />
              Nutzungsbedingungen
            </button>
            <button
              onClick={() => navigate('/impressum')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              Impressum
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('auth.logout')}
            </button>
            {!isGuest && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Konto löschen
              </button>
            )}
          </div>
        </div>
      </Layout>
      <BottomNav />
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
}
