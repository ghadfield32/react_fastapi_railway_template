import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface AuthCtx {
  token: string | null
  login: (t: string) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Initialize from localStorage on mount
    return localStorage.getItem('jwt')
  })

  const login = (t: string) => {
    setToken(t)
    localStorage.setItem('jwt', t)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('jwt')
  }

  return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

// Simple helper for axios interceptor - no hooks!
export const getStoredToken = () => localStorage.getItem('jwt') 

