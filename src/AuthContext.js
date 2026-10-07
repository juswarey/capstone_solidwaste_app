import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getRole, getToken, saveRole, saveToken, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const SIGNED_OUT = { loading: false, signedIn: false, role: null, name: '' };

export function AuthProvider({ children }) {
  const [state, setState] = useState({ ...SIGNED_OUT, loading: true });

  const reset = useCallback(async () => {
    await clearToken();
    setState(SIGNED_OUT);
  }, []);

  // Restore the session when the app starts.
  useEffect(() => {
    setUnauthorizedHandler(reset);
    (async () => {
      const token = await getToken();
      if (!token) return setState(SIGNED_OUT);
      try {
        const s = await api('session.php');
        await saveRole(s.role);
        setState({ loading: false, signedIn: true, role: s.role, name: s.name });
      } catch {
        // Offline: keep the user in if we still know their role.
        // (An expired token is cleared by the 401 handler instead.)
        const stillHasToken = await getToken();
        const role = await getRole();
        setState(stillHasToken && role ? { loading: false, signedIn: true, role, name: '' } : SIGNED_OUT);
      }
    })();
  }, [reset]);

  const finishAuth = async (data) => {
    await saveToken(data.token);
    await saveRole(data.role);
    setState({ loading: false, signedIn: true, role: data.role, name: data.name });
  };

  const value = useMemo(
    () => ({
      ...state,
      signIn: async (email, password) =>
        finishAuth(await api('login.php', { method: 'POST', body: { email, password }, auth: false })),
      register: async (payload) =>
        finishAuth(await api('register.php', { method: 'POST', body: payload, auth: false })),
      signOut: async () => {
        try { await api('logout.php', { method: 'POST' }); } catch { /* ignore */ }
        await reset();
      },
      setName: (name) => setState((s) => ({ ...s, name })),
    }),
    [state, reset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
