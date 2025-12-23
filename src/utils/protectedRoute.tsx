import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/authContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login, error } = useAuth();

  // Automatically redirect to Keycloak if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      login(); // This will redirect to Keycloak login page
    }
  }, [isLoading, isAuthenticated, login, error]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;