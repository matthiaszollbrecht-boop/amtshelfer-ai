import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getProfile, ensureProfile, updateAnalysesUsed, setPremiumStatus,
  verifyPurchase, restoreSubscription,
} from '../lib/db';
import {
  purchaseSubscription as doPlayPurchase,
  getExistingPurchases,
  BillingError,
  type ProductId,
} from '../services/billingService';

interface PremiumContextType {
  isPremium: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
  subscriptionExpiresAt: Date | null;
  analysesUsed: number;
  analysesLimit: number;
  canAnalyze: boolean;
  purchaseLoading: boolean;
  restoreLoading: boolean;
  incrementUsage: () => void;
  setPremium: (val: boolean) => void;
  purchaseSubscription: (productId: ProductId) => Promise<void>;
  restorePurchases: () => Promise<{ restored: boolean; message?: string }>;
  resetMonthly: () => void;
}

const FREE_LIMIT = 3;

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  subscriptionType: null,
  subscriptionExpiresAt: null,
  analysesUsed: 0,
  analysesLimit: FREE_LIMIT,
  canAnalyze: true,
  purchaseLoading: false,
  restoreLoading: false,
  incrementUsage: () => {},
  setPremium: () => {},
  purchaseSubscription: async () => {},
  restorePurchases: async () => ({ restored: false }),
  resetMonthly: () => {},
});

// ─── Guest helpers ─────────────────────────────────────────────────────────

function getGuestUsed(): number {
  const saved = localStorage.getItem('amtsHelfer_analysesUsed');
  const savedMonth = localStorage.getItem('amtsHelfer_usageMonth');
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (savedMonth !== currentMonth) {
    localStorage.setItem('amtsHelfer_usageMonth', currentMonth);
    localStorage.setItem('amtsHelfer_analysesUsed', '0');
    return 0;
  }
  return saved ? parseInt(saved, 10) : 0;
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();

  const [isPremium, setIsPremiumState] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'yearly' | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);
  const [analysesUsed, setAnalysesUsedState] = useState(() =>
    isGuest ? getGuestUsed() : 0
  );
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Sync premium state from profile on login
  useEffect(() => {
    if (!user) return;
    const currentMonth = new Date().toISOString().slice(0, 7);

    (async () => {
      try {
        const profile = await ensureProfile(user.id, user.email ?? '');
        const savedMonth = localStorage.getItem('amtsHelfer_usageMonth');

        if (savedMonth !== currentMonth) {
          localStorage.setItem('amtsHelfer_usageMonth', currentMonth);
          await updateAnalysesUsed(user.id, 0);
          setAnalysesUsedState(0);
        } else {
          setAnalysesUsedState(profile.analyses_used);
        }

        // Check subscription expiry
        const expiresAt = profile.subscription_expires_at
          ? new Date(profile.subscription_expires_at)
          : null;
        const isExpired = expiresAt ? expiresAt < new Date() : false;

        if (profile.is_premium && isExpired) {
          await setPremiumStatus(user.id, false);
          setIsPremiumState(false);
          setSubscriptionType(null);
          setSubscriptionExpiresAt(null);
        } else {
          setIsPremiumState(profile.is_premium);
          setSubscriptionType(profile.subscription_type ?? null);
          setSubscriptionExpiresAt(expiresAt);
        }
      } catch (err) {
        console.error('PremiumProvider sync error:', err);
      }
    })();
  }, [user]);

  // Reset when user logs out
  useEffect(() => {
    if (user !== null) return;
    setIsPremiumState(false);
    setSubscriptionType(null);
    setSubscriptionExpiresAt(null);
    setAnalysesUsedState(isGuest ? getGuestUsed() : 0);
  }, [user, isGuest]);

  const canAnalyze = isPremium || analysesUsed < FREE_LIMIT;

  const incrementUsage = useCallback(() => {
    if (isPremium) return;
    const next = analysesUsed + 1;
    setAnalysesUsedState(next);
    if (user) {
      updateAnalysesUsed(user.id, next);
    } else {
      localStorage.setItem('amtsHelfer_analysesUsed', String(next));
    }
  }, [analysesUsed, isPremium, user]);

  const setPremium = useCallback(async (val: boolean) => {
    setIsPremiumState(val);
    if (!val) {
      setSubscriptionType(null);
      setSubscriptionExpiresAt(null);
    }
    if (user) {
      await setPremiumStatus(user.id, val);
    } else {
      localStorage.setItem('amtsHelfer_premium', String(val));
    }
  }, [user]);

  const purchaseSubscription = useCallback(async (productId: ProductId) => {
    if (!user) throw new BillingError('not_logged_in', 'Bitte zuerst einloggen.');
    setPurchaseLoading(true);
    try {
      const { purchaseToken } = await doPlayPurchase(productId);
      const result = await verifyPurchase(purchaseToken, productId);

      if (!result.premium) {
        throw new BillingError('verification_failed', 'Kauf konnte nicht verifiziert werden.');
      }

      setIsPremiumState(true);
      setSubscriptionType(result.subscriptionType ?? null);
      setSubscriptionExpiresAt(result.expiresAt ? new Date(result.expiresAt) : null);
    } finally {
      setPurchaseLoading(false);
    }
  }, [user]);

  const restorePurchases = useCallback(async (): Promise<{ restored: boolean; message?: string }> => {
    if (!user) return { restored: false, message: 'Nicht eingeloggt.' };
    setRestoreLoading(true);
    try {
      // Check Play for active purchases not yet in DB
      const activePurchases = await getExistingPurchases();
      if (activePurchases.length > 0) {
        const { productId, purchaseToken } = activePurchases[0];
        const result = await verifyPurchase(purchaseToken, productId);
        if (result.premium) {
          setIsPremiumState(true);
          setSubscriptionType(result.subscriptionType ?? null);
          setSubscriptionExpiresAt(result.expiresAt ? new Date(result.expiresAt) : null);
          return { restored: true };
        }
      }

      // Fallback: re-validate stored token in DB
      const result = await restoreSubscription();
      if (result.premium) {
        setIsPremiumState(true);
        const profile = await getProfile(user.id);
        setSubscriptionType(profile?.subscription_type ?? null);
        setSubscriptionExpiresAt(
          profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null
        );
        return { restored: true };
      }

      return { restored: false, message: 'Kein aktives Abonnement gefunden.' };
    } catch {
      return { restored: false, message: 'Wiederherstellung fehlgeschlagen.' };
    } finally {
      setRestoreLoading(false);
    }
  }, [user]);

  const resetMonthly = useCallback(async () => {
    setAnalysesUsedState(0);
    const currentMonth = new Date().toISOString().slice(0, 7);
    localStorage.setItem('amtsHelfer_usageMonth', currentMonth);
    if (user) {
      await updateAnalysesUsed(user.id, 0);
    } else {
      localStorage.setItem('amtsHelfer_analysesUsed', '0');
    }
  }, [user]);

  return (
    <PremiumContext.Provider value={{
      isPremium,
      subscriptionType,
      subscriptionExpiresAt,
      analysesUsed,
      analysesLimit: FREE_LIMIT,
      canAnalyze,
      purchaseLoading,
      restoreLoading,
      incrementUsage,
      setPremium,
      purchaseSubscription,
      restorePurchases,
      resetMonthly,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
