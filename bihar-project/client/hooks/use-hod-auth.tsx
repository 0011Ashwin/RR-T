import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HODUser, SAMPLE_HODS } from '@shared/resource-types';

interface HODAuthContextType {
  currentHOD: HODUser | null;
  allHODs: HODUser[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchHOD: (hodId: string) => void;
  isAuthenticated: boolean;
}

const HODAuthContext = createContext<HODAuthContextType | undefined>(undefined);

interface HODAuthProviderProps {
  children: ReactNode;
}

export const HODAuthProvider: React.FC<HODAuthProviderProps> = ({ children }) => {
  const [currentHOD, setCurrentHOD] = useState<HODUser | null>(null);
  const [allHODs] = useState<HODUser[]>(SAMPLE_HODS);

  // Load HOD from localStorage on mount
  useEffect(() => {
    const savedHODId = localStorage.getItem('currentHODId');
    if (savedHODId) {
      const hod = allHODs.find(h => h.id === savedHODId);
      if (hod) {
        setCurrentHOD(hod);
      }
    }
  }, [allHODs]);

  const login = async (email: string): Promise<boolean> => {
    const hod = allHODs.find(h => h.email === email && h.isActive);
    if (hod) {
      setCurrentHOD(hod);
      localStorage.setItem('currentHODId', hod.id);
      localStorage.setItem('userRole', 'hod');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentHOD(null);
    localStorage.removeItem('currentHODId');
    localStorage.removeItem('userRole');
  };

  const switchHOD = (hodId: string) => {
    const hod = allHODs.find(h => h.id === hodId);
    if (hod) {
      setCurrentHOD(hod);
      localStorage.setItem('currentHODId', hod.id);
    }
  };

  const value: HODAuthContextType = {
    currentHOD,
    allHODs,
    login,
    logout,
    switchHOD,
    isAuthenticated: currentHOD !== null,
  };

  return (
    <HODAuthContext.Provider value={value}>
      {children}
    </HODAuthContext.Provider>
  );
};

export const useHODAuth = (): HODAuthContextType => {
  const context = useContext(HODAuthContext);
  if (context === undefined) {
    throw new Error('useHODAuth must be used within a HODAuthProvider');
  }
  return context;
};
