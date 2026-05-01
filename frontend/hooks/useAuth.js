"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/token';
import { logout as logoutService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      // Restore user from localStorage (saved at login time)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('user');
        }
      } else {
        // Token exists but no user data — treat as unauthenticated
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Persist user data so role survives page refresh
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    await logoutService();
    removeToken();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
