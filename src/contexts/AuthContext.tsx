import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  setGuest: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isGuest: false,
  loading: true,
  signOut: async () => {},
  setGuest: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Restore guest mode from localStorage
    if (localStorage.getItem('amtsHelfer_guest') === 'true') {
      setIsGuest(true);
    }

    // Get existing session (does not trigger onAuthStateChange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Network errors on mobile — clear local state anyway
    }
    // Always clear local state regardless of network success
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('amtsHelfer_guest');
    localStorage.removeItem('amtsHelfer_loggedIn');
    // Remove Supabase auth tokens so the session can't auto-restore on next load
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase.auth')) {
        localStorage.removeItem(key);
      }
    });
  };

  const setGuest = (val: boolean) => {
    setIsGuest(val);
    if (val) {
      localStorage.setItem('amtsHelfer_guest', 'true');
      localStorage.setItem('amtsHelfer_loggedIn', 'true');
    } else {
      localStorage.removeItem('amtsHelfer_guest');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isGuest, loading, signOut, setGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
