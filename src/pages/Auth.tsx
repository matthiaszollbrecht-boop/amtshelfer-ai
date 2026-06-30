import { useState } from 'react';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, LogIn, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

interface AuthProps {
  onLogin?: (email: string, isGuest: boolean) => void;
}

export default function Auth(_props: AuthProps = {}) {
  const { t } = useI18n();
  const { setGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === 'forgot') {
      if (!email) { setLoading(false); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          'E-Mail zum Zurücksetzen des Passworts wurde gesendet. Bitte prüfen Sie Ihren Posteingang.'
        );
      }
      setLoading(false);
      return;
    }

    if (!email || !password) { setLoading(false); return; }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message.includes('Invalid login') || error.message.includes('invalid')
            ? 'E-Mail oder Passwort falsch. Bitte erneut versuchen.'
            : error.message
        );
      }
    } else {
      if (password.length < 6) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        setError(
          error.message.includes('already registered')
            ? 'Diese E-Mail-Adresse ist bereits registriert.'
            : error.message
        );
      } else {
        setSuccess('Registrierung erfolgreich! Sie sind jetzt eingeloggt.');
      }
    }

    setLoading(false);
  };

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">AH</span>
          </div>
        </div>

        {/* Back button for forgot mode */}
        {mode === 'forgot' && (
          <button
            onClick={() => switchMode('login')}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Anmeldung
          </button>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {mode === 'login' && t('auth.login')}
          {mode === 'register' && t('auth.register')}
          {mode === 'forgot' && 'Passwort zurücksetzen'}
        </h1>

        {mode === 'forgot' && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen.
          </p>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              placeholder={t('auth.email')}
              required
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder={t('auth.password')}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || (mode !== 'forgot' && !password)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading
              ? mode === 'login' ? 'Anmelden…' : mode === 'register' ? 'Registrieren…' : 'Senden…'
              : mode === 'login' ? t('auth.login') : mode === 'register' ? t('auth.register') : 'Reset-Link senden'}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">{t('auth.orLoginWith')}</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <button
              onClick={() => setGuest(true)}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-medium py-3 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('auth.guest')}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">{t('auth.guestDesc')}</p>

            <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                {mode === 'login' ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
