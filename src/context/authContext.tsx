import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  login: () => void;
  register: () => void;
  logout: () => void;
  error: string | null;
  isAdmin: boolean; // Add isAdmin property
}

const initialAuthContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  username: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  error: null,
  isAdmin: false // Initialize isAdmin property
};

const AuthContext = createContext<AuthContextType>(initialAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add isAdmin state
  
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    const initAuth = async () => {
      try {
        isInitialized.current = true;
        console.log('Initializing Authentication...');

        const authenticated = await authService.init();
        
        console.log('Authentication initialized, authenticated:', authenticated);
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const username = authService.getUsername();
          setUsername(username || null);
          console.log('User logged in:', username);
          
          // Check if user is admin
          const adminStatus = authService.isAdmin();
          setIsAdmin(adminStatus);
          console.log('User is admin:', adminStatus);

          const token = authService.getToken();
          console.log(token);
        }
      } catch (err) {
        console.error('Authentication init error:', err);
        setError(`Failed to initialize authentication: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    console.log('Redirecting to login...');
    authService.login();
  };

  const logout = () => {
    console.log('Logging out...');
    authService.logout();
  };

  const register = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch("http://localhost:9091/api/user/register", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("✅ User info sent to backend");
      } else {
        console.error("❌ Failed to register user info", await response.text());
      }
    } catch (error) {
      console.error("❌ Network error", error);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    username,
    login,
    register,
    logout,
    error,
    isAdmin // Include isAdmin in the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
