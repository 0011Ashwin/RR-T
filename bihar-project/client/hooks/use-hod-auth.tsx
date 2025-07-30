import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HODUser, SAMPLE_HODS } from '../../shared/resource-types';

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
      fetchHODData(savedHODId);
    }
  }, []);

  const fetchHODData = async (hodId: string) => {
    try {
      const response = await fetch(`/api/hod-auth/profile/${hodId}`);
      if (response.ok) {
        const hodData = await response.json();
        // Convert backend format to frontend format
        const frontendHOD = {
          id: hodData.id.toString(),
          name: hodData.name,
          email: hodData.email,
          designation: hodData.designation,
          department: hodData.department_name || 'Unknown Department',
          employeeId: hodData.employee_id,
          joinDate: hodData.join_date,
          experience: hodData.experience,
          avatar: hodData.avatar,
          isActive: hodData.is_active,
          phone: hodData.phone
        };
        setCurrentHOD(frontendHOD);
      } else {
        // If fetch fails, try to find in sample data
        const hod = allHODs.find(h => h.id === hodId);
        if (hod) {
          setCurrentHOD(hod);
        }
      }
    } catch (error) {
      console.error('Error fetching HOD data:', error);
      // Fallback to sample data
      const hod = allHODs.find(h => h.id === hodId);
      if (hod) {
        setCurrentHOD(hod);
      }
    }
  };

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
