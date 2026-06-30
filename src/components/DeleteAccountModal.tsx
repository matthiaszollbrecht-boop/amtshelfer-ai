import { useState } from 'react';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';
import { deleteAccount } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../contexts/PremiumContext';

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const { signOut } = useAuth();
  const { isPremium } = usePremium();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!confirmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAccount();
      localStorage.clear();
      sessionStorage.clear();
      await signOut();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Löschen fehlgeschlagen. Bitte versuchen Sie es erneut.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Konto löschen
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-40"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Warning */}
          <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              Möchten Sie Ihr Konto und alle zugehörigen Daten wirklich dauerhaft löschen?{' '}
              <strong>Diese Aktion kann nicht rückgängig gemacht werden.</strong>
            </p>
          </div>

          {/* What gets deleted */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Folgende Daten werden gelöscht:
            </p>
            {[
              'E-Mail-Adresse und Login-Daten',
              'Alle gespeicherten Dokumente & Analysen',
              'Alle Erinnerungen & Fristen',
              'Profil- und Premium-Daten',
            ].map(item => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {/* Google Play warning — only shown to premium users */}
          {isPremium && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                <strong>Abo-Hinweis:</strong> Bitte kündigen Sie Ihr Abo zusätzlich im{' '}
                <strong>Google Play Store</strong>. Die Kontolöschung beendet nicht
                automatisch Ihr Google-Play-Abonnement.
              </p>
            </div>
          )}

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              disabled={loading}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Ich verstehe, dass alle meine Daten dauerhaft gelöscht werden.
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || loading}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Löschen…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Konto löschen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
