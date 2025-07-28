import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAuth = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Save the current location for redirect after login
      const returnUrl = location.pathname + location.search;
      navigate(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, loading, navigate, redirectTo, location]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          <p className="text-slate-500 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the children
  return children;
};

export default RequireAuth;
