import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/authService.js';
import { useToast } from '../hooks/use-toast';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authAPI.getToken();
        const storedUser = authAPI.getUser();

        if (token && storedUser) {
          // Verify token is still valid by getting current user
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            authAPI.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Auto-login after successful registration
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Show welcome toast for new users
        toast({
          title: `Welcome to StackIt, ${response.data.user.name}! 🎉`,
          description: "Your account has been created successfully. Start exploring!",
          duration: 5000,
        });
        
        return response;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Show welcome back toast
        toast({
          title: `Welcome back, ${response.data.user.name}! 👋`,
          description: "Welcome back to StackIt",
          duration: 4000,
        });
        
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateAccount(userData);
      
      if (response.success) {
        setUser(response.data);
        return response;
      }
      throw new Error(response.message || 'Profile update failed');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await authAPI.changePassword(passwordData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update avatar
  const updateAvatar = async (avatarData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateAvatar(avatarData);
      
      if (response.success) {
        setUser(response.data);
        return response;
      }
      throw new Error(response.message || 'Avatar update failed');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    updateAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
