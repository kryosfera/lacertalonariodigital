import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./useAuth";

export type UserMode = 'basic' | 'professional' | null;

interface UserModeContextType {
  userMode: UserMode;
  isLoading: boolean;
  setUserMode: (mode: 'basic' | 'professional') => void;
  upgradeToProfessional: () => void;
  switchToBasic: () => void;
  showProfileSelector: boolean;
  setShowProfileSelector: (show: boolean) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

const USER_MODE_KEY = 'lacer_user_mode';

export function UserModeProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [userMode, setUserModeState] = useState<UserMode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // If user is authenticated, they're automatically professional
    if (user) {
      setUserModeState('professional');
      localStorage.setItem(USER_MODE_KEY, 'professional');
      setIsLoading(false);
      return;
    }

    // Check localStorage for saved preference
    const savedMode = localStorage.getItem(USER_MODE_KEY) as UserMode;
    
    if (savedMode === 'basic' || savedMode === 'professional') {
      setUserModeState(savedMode);
      setIsLoading(false);
    } else {
      // No saved preference, show selector
      setShowProfileSelector(true);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const setUserMode = (mode: 'basic' | 'professional') => {
    setUserModeState(mode);
    localStorage.setItem(USER_MODE_KEY, mode);
    setShowProfileSelector(false);
  };

  const upgradeToProfessional = () => {
    localStorage.setItem(USER_MODE_KEY, 'professional');
  };

  const switchToBasic = () => {
    setUserModeState('basic');
    localStorage.setItem(USER_MODE_KEY, 'basic');
  };

  return (
    <UserModeContext.Provider value={{
      userMode,
      isLoading,
      setUserMode,
      upgradeToProfessional,
      showProfileSelector,
      setShowProfileSelector
    }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}
