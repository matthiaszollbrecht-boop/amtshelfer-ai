import { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { usePremium } from '../contexts/PremiumContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import {
  Check, Crown, Zap, Shield, Globe, Bell, Sparkles, MessageSquare,
  Loader2, RefreshCw, AlertCircle, Calendar, CheckCircle2,
} from 'lucide-react';
import {
  PRODUCT_IDS, getProductDetails, isGooglePlayBillingAvailable,
  BillingError, type ProductId, type ProductDetails,
} from '../services/billingService';

const PREMIUM_FEATURES = [
  { icon: Zap, text: 'Unbegrenzte Dokumentenanalysen' },
  { icon: MessageSquare, text: 'KI-Antwortbriefe generieren' },
  { icon: Globe, text: 'Alle 7 Sprachen verfügbar' },
  { icon: Bell, text: 'Fristenerinnerungen & Archiv' },
  { icon: Sparkles, text: 'Höchste Analysequalität (GPT-4o)' },
];

const FREE_FEATURES = [
  '3 Analysen pro Monat',
  'Basis-Dokumentenerkennung',
  'Deutsch & Englisch',
];

function PlanBadge({ label }: { label: string }) {
  return (
    <span className="absolute -top-3 end-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
      {label}
    </span>
  );
}

export default function Premium() {
  const { t } = useI18n();
  const {
    isPremium, subscriptionType, subscriptionExpiresAt,
    analysesUsed, analysesLimit,
    purchaseLoading, restoreLoading,
    purchaseSubscription, restorePurchases,
  } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<ProductId>(PRODUCT_IDS.YEARLY);
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<string | null>(null);
  const billingAvailable = isGooglePlayBillingAvailable();

  useEffect(() => {
    getProductDetails().then(setProducts).catch(() => {});
  }, []);

  const getProduct = (id: ProductId) => products.find(p => p.productId === id);

  const handlePurchase = async () => {
    setError(null);
    try {
      await purchaseSubscription(selectedPlan);
    } catch (err) {
      if (err instanceof BillingError) {
        if (err.code !== 'cancelled') setError(err.message);
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten.');
      }
    }
  };

  const handleRestore = async () => {
    setRestoreResult(null);
    setError(null);
    const result = await restorePurchases();
    setRestoreResult(
      result.restored
        ? 'Abonnement erfolgreich wiederhergestellt!'
        : (result.message ?? 'Kein aktives Abonnement gefunden.')
    );
  };

  // ── Active Premium Screen ────────────────────────────────────────────────
  if (isPremium) {
    const expiryStr = subscriptionExpiresAt
      ? subscriptionExpiresAt.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
      : null;
    const planLabel = subscriptionType === 'monthly' ? 'Monatlich' : subscriptionType === 'yearly' ? 'Jährlich' : '';

    return (
      <>
        <Layout title={t('premium.title')} showBack>
          <div className="py-6 space-y-5">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AmtsHelfer AI Premium</h2>
                {planLabel && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">{planLabel}</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Premium aktiv — Unbegrenzte Analysen
                  </p>
                  {expiryStr && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Verlängert sich am {expiryStr}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl border border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Ihre Vorteile</h3>
              <ul className="space-y-2.5">
                {PREMIUM_FEATURES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
                Kündigung: Google Play Store → Abonnements → AmtsHelfer AI
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Gesicherte Zahlung über Google Play</span>
            </div>
          </div>
        </Layout>
        <BottomNav />
      </>
    );
  }

  // ── Purchase Screen ──────────────────────────────────────────────────────
  const monthlyProduct = getProduct(PRODUCT_IDS.MONTHLY);
  const yearlyProduct = getProduct(PRODUCT_IDS.YEARLY);

  return (
    <>
      <Layout title={t('premium.title')} showBack>
        <div className="space-y-4 pb-2">
          {/* Header */}
          <div className="text-center py-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AmtsHelfer AI Premium</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Alle Behördenbriefe — ohne Limits
            </p>
          </div>

          {/* Usage bar */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Kostenlose Analysen</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{analysesUsed}/{analysesLimit}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${analysesUsed >= analysesLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min((analysesUsed / analysesLimit) * 100, 100)}%` }}
              />
            </div>
            {analysesUsed >= analysesLimit && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                Limit erreicht — Premium freischalten für unbegrenzte Analysen
              </p>
            )}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlan(PRODUCT_IDS.MONTHLY)}
              className={`relative p-4 rounded-2xl border-2 text-start transition-all ${
                selectedPlan === PRODUCT_IDS.MONTHLY
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Monatlich</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {monthlyProduct?.price ?? '6,99 €'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">pro Monat</p>
              {selectedPlan === PRODUCT_IDS.MONTHLY && (
                <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedPlan(PRODUCT_IDS.YEARLY)}
              className={`relative p-4 rounded-2xl border-2 text-start transition-all ${
                selectedPlan === PRODUCT_IDS.YEARLY
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <PlanBadge label="2 Monate gratis" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Jährlich</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {yearlyProduct?.price ?? '69,99 €'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                ≈ {(69.99 / 12).toFixed(2).replace('.', ',')} € / Monat
              </p>
              {selectedPlan === PRODUCT_IDS.YEARLY && (
                <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>

          {/* Features comparison */}
          <div className="grid gap-3">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Kostenlos</p>
              <ul className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">Premium</p>
              <ul className="space-y-2.5">
                {PREMIUM_FEATURES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Restore result */}
          {restoreResult && (
            <div className={`p-3 rounded-xl border ${
              restoreResult.includes('erfolgreich')
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <p className={`text-xs leading-relaxed ${
                restoreResult.includes('erfolgreich')
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>{restoreResult}</p>
            </div>
          )}

          {/* Play not available notice */}
          {!billingAvailable && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Google Play Billing ist nur in der Android-App verfügbar. Bitte laden Sie AmtsHelfer AI aus dem Google Play Store herunter.
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handlePurchase}
            disabled={purchaseLoading || !billingAvailable}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
              billingAvailable
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-600/20'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {purchaseLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                {selectedPlan === PRODUCT_IDS.MONTHLY
                  ? `Monatlich — ${monthlyProduct?.price ?? '6,99 €'}`
                  : `Jährlich — ${yearlyProduct?.price ?? '69,99 €'}`
                }
              </>
            )}
          </button>

          {/* Restore button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleRestore}
              disabled={restoreLoading}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {restoreLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
              }
              Kauf wiederherstellen
            </button>
          </div>

          {/* Footer */}
          <div className="space-y-1.5 pb-2">
            <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Gesicherte Zahlung über Google Play</span>
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              Automatische Verlängerung. Kündigung jederzeit im Google Play Store.
            </p>
          </div>
        </div>
      </Layout>
      <BottomNav />
    </>
  );
}
