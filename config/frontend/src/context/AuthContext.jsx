import { createContext, useContext, useState, useEffect } from 'react';
import localAuth from '../services/localAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // INITIALIZATION
  // ==========================================

  useEffect(() => {
    console.log('Initializing local auth...');
    
    // Initialize demo users if needed
    localAuth.initializeDemoUsers();
    
    // Check for existing session
    const session = localAuth.getCurrentSession();
    if (session) {
      console.log('Found existing session:', session.email);
      setUser(session);
      fetchUserData(session.userId);
    }
    
    setLoading(false);
  }, []);

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const fetchUserData = (userId) => {
    // Fetch profile
    const userData = localAuth.getUserById(userId);
    if (userData) {
      setProfile({
        id: userData.id,
        email: userData.email,
        full_name: userData.name,
        country: userData.country,
        created_at: userData.createdAt
      });
    }
    
    // Fetch wallets
    const walletsData = localAuth.getUserWallets(userId);
    if (walletsData) {
      const walletsArray = Object.values(walletsData);
      setWallets(walletsArray);
    }
    
    // Fetch transactions
    const transactionsData = localAuth.getUserTransactions(userId);
    setTransactions(transactionsData);
  };

  // ==========================================
  // AUTH FUNCTIONS
  // ==========================================

  const login = async (email, password) => {
    try {
      console.log('Logging in:', email);
      setError(null);

      const result = localAuth.login(email, password);

      if (!result.success) {
        console.error('Login failed:', result.error);
        setError(result.error);
        return { success: false, message: result.error };
      }

      console.log('Login successful:', result.user.email);
      setUser(result.user);
      fetchUserData(result.user.userId);

      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed';
      console.error('Login error:', message);
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (email, password, name, country) => {
    try {
      console.log('Registering new user:', email);
      setError(null);

      const result = localAuth.register(email, password, name, country);

      if (!result.success) {
        console.error('Registration failed:', result.error);
        setError(result.error);
        return { success: false, message: result.error };
      }

      console.log('Registration successful:', result.user.email);
      
      // Auto-login after registration
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        return { success: true };
      } else {
        return loginResult;
      }
    } catch (err) {
      const message = err.message || 'Registration failed';
      console.error('Registration error:', message);
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      console.log('Signing out...');
      localAuth.logout();
      setUser(null);
      setProfile(null);
      setWallets([]);
      setTransactions([]);
      console.log('Signed out successfully');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // ==========================================
  // PROFILE UPDATE
  // ==========================================

  const updateProfile = async (updates) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    
    const result = localAuth.updateProfile(user.userId, updates);
    
    if (result.success) {
      setUser({ ...user, ...updates });
      setProfile({ ...profile, ...updates });
    }
    
    return result;
  };

  // Refresh user data (alias for refreshData)
  const refreshUserData = async () => {
    if (user) {
      fetchUserData(user.userId);
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    user,
    profile,
    wallets,
    transactions,
    loading,
    error,
    isAuthenticated: !!user,
    isProfileComplete: !!profile,
    login,
    register,
    logout,
    updateProfile,
    refreshData: () => user && fetchUserData(user.userId),
    refreshUserData,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
