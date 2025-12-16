
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * [MİMARİ: KİMLİK DOĞRULAMA]
 * Amaç: Kullanıcı oturum durumunu uygulama genelinde yönetmek.
 * Prensip: Single Responsibility (Sadece auth durumunu yönetir).
 */

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  userEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Başlangıç durumunu localStorage'dan okuyarak kalıcılık sağla (Fail Safe)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true';
    } catch (error) {
      console.error("[AUTH_INIT_ERROR] LocalStorage okunamadı:", error);
      return false;
    }
  });

  const [userEmail] = useState('ferhat.cngz0@gmail.com'); // Sabit demo kullanıcısı

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook ile erişimi kolaylaştır (Encapsulation)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
