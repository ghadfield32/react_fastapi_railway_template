import React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthCtx {
  token: string | null;
  verified: boolean;
  login: (t: string) => void;
  logout: () => void;
  markVerified: () => void;
  invalidate: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt'));
  const [verified, setVerified] = useState(false);

  const login = (t: string) => {
    setToken(t);
    setVerified(false);              // must re-check with server
    localStorage.setItem('jwt', t);
  };

  const logout = () => {
    setToken(null);
    setVerified(false);
    localStorage.removeItem('jwt');
  };

  const markVerified = () => setVerified(true);
  const invalidate   = () => logout();

  return (
    <Ctx.Provider value={{ token, verified, login, logout, markVerified, invalidate }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// No hooks – safe for axios interceptor
export const getStoredToken = () => localStorage.getItem('jwt'); 


