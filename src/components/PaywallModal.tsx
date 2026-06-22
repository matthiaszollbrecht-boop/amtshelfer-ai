import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePremium } from '../contexts/PremiumContext';
import { Crown, X, Zap, MessageSquare, Globe, Bell, Sparkles } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export default function PaywallModal({ open, onClose, feature }: PaywallModalProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { analysesUsed, analysesLimit } = usePremium();

  if (!open) return null;

  const premiumFeatures = t('premium.premiumFeatures').split('\n');
  const icons = [Zap, MessageSquare, Globe, Bell, Sparkles];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 max-w-sm w-full shadow-xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Premium</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {feature && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {feature} {t('premium.featureLocked')}
          </p>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-bold">{analysesUsed}/{analysesLimit}</span> {t('premium.freeAnalyses')} ({t('premium.free')})
          </p>
        </div>

        <div className="space-y-2 mb-5">
          {premiumFeatures.map((f, i) => {
            const Icon = icons[i] || Zap;
            return (
              <div key={i} className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => { onClose(); navigate('/premium'); }}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" />
          {t('premium.subscribe')} — {t('premium.price')}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
