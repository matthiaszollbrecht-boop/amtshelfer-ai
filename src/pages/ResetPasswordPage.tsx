import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PageState = 'loading' | 'form' | 'success' | 'invalid';

// Parse hash fragment into key/value pairs
function parseHash(hash: string): Record<string, string> {
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  return Object.fromEntries(new URLSearchParams(clean).entries());
}

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;

    const settle = (state: PageState) => {
      if (!settled) {
        settled = true;
        setPageState(state);
      }
    };

    // 1. Listen for Supabase auth events (covers PKCE code exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        settle('form');
      } else if (event === 'SIGNED_IN' && session) {
        // PKCE may emit SIGNED_IN before PASSWORD_RECOVERY — check if it's a recovery
        const hash = parseHash(window.location.hash);
        if (hash.type === 'recovery') {
          settle('form');
        }
        // If SIGNED_IN fires and we're on this page, still show the form
        // (better UX than "invalid link")
        settle('form');
      }
    });

    // 2. Trigger PKCE code exchange by calling getSession
    //    (Supabase detects ?code= in the URL and exchanges it automatically)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) settle('form');
    });

    // 3. Handle implicit flow: tokens in URL hash (#access_token=...&type=recovery)
    const hash = parseHash(window.location.hash);
    if (hash.access_token && hash.refresh_token && hash.type === 'recovery') {
      supabase.auth
        .setSession({ access_token: hash.access_token, refresh_token: hash.refresh_token })
        .then(({ data: { session }, error }) => {
          if (session && !error) {
            // Clear the hash from the URL so tokens aren't visible
            window.history.replaceState(null, '', window.location.pathname);
            settle('form');
          }
        });
    }

    // 4. Safety timeout — if nothing triggered after 6s, show "invalid link"
    const timeout = setTimeout(() => settle('invalid'), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      await supabase.auth.signOut();
      setPageState('success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Logo bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AH</span>
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">AmtsHelfer AI</span>
      </div>

      <div className="w-full max-w-sm">

        {/* Loading */}
        {pageState === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Link wird überprüft…</p>
          </div>
        )}

        {/* Invalid / expired */}
        {pageState === 'invalid' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Link ungültig oder abgelaufen</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Dieser Passwort-Reset-Link ist nicht mehr gültig. Bitte fordern Sie in der App einen neuen Link an.
            </p>
            <a
              href="/"
              className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors text-center"
            >
              Zur App
            </a>
          </div>
        )}

        {/* Password form */}
        {pageState === 'form' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Neues Passwort setzen</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Wählen Sie ein sicheres Passwort für Ihr Konto.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="Neues Passwort (mind. 6 Zeichen)"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(null); }}
                  placeholder="Passwort bestätigen"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Password match indicator */}
              {confirm.length > 0 && (
                <p className={`text-xs ${password === confirm ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {password === confirm ? '✓ Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !password || !confirm || password !== confirm}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-900/50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Speichern…</>
                ) : (
                  'Passwort speichern'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Success */}
        {pageState === 'success' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Passwort gespeichert</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt mit dem neuen Passwort anmelden.
            </p>
            <a
              href="/"
              className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors text-center"
            >
              Zur Anmeldung
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
