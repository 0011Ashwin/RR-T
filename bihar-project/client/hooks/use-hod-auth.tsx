import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HODUser } from '../../shared/resource-types';
import { HODService } from '@/services/hod-service';

interface HODAuthContextType {
  currentHOD: HODUser | null;
  allHODs: HODUser[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchHOD: (hodId: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const HODAuthContext = createContext<HODAuthContextType | undefined>(undefined);

interface HODAuthProviderProps {
  children: ReactNode;
}

export const HODAuthProvider: React.FC<HODAuthProviderProps> = ({ children }) => {
  const [currentHOD, setCurrentHOD] = useState<HODUser | null>(null);
  const [allHODs, setAllHODs] = useState<HODUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load HODs from database on mount
  useEffect(() => {
    const loadHODs = async () => {
      setIsLoading(true);
      try {
        const response = await HODService.getAllHODs();
        if (response.success && response.data) {
          setAllHODs(response.data);
        }
      } catch (error) {
        console.error('Error loading HODs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHODs();
  }, []);

  // Load current HOD from localStorage on mount
  useEffect(() => {
    const savedHODId = localStorage.getItem('currentHODId');
    if (savedHODId && allHODs.length > 0) {
      const hod = allHODs.find(h => h.id === savedHODId);
      if (hod) {
        setCurrentHOD(hod);
      }
    }
  }, [allHODs]);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await HODService.login(email);
      if (response.success && response.data) {
        setCurrentHOD(response.data);
        localStorage.setItem('currentHODId', response.data.id);
        localStorage.setItem('userRole', 'hod');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
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
    isLoading,
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
