/**
 * Auto-Admin Detection Hook
 * Automatically detects bknglabs.dev@gmail.com and redirects to admin panel
 * Provides seamless admin experience without manual setup
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

interface AutoAdminState {
  isAutoAdmin: boolean;
  isLoading: boolean;
  redirecting: boolean;
  adminUser: any;
}

export function useAutoAdmin() {
  const [state, setState] = useState<AutoAdminState>({
    isAutoAdmin: false,
    isLoading: true,
    redirecting: false,
    adminUser: null
  });
  
  const router = useRouter();

  useEffect(() => {
    checkAutoAdminStatus();
  }, []);

  const checkAutoAdminStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if user is auto-admin
      const { data: isAutoAdmin, error: adminError } = await supabase
        .rpc('is_auto_admin', { user_uuid: user.id });

      if (isAutoAdmin) {
        setState(prev => ({ 
          ...prev, 
          isAutoAdmin: true, 
          adminUser: user,
          isLoading: false 
        }));

        // Auto-redirect to admin panel for auto-admin
        await autoRedirectToAdmin();
      } else {
        setState(prev => ({ ...prev, isAutoAdmin: false, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking auto-admin status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const autoRedirectToAdmin = async () => {
    try {
      setState(prev => ({ ...prev, redirecting: true }));
      
      // Small delay to show the experience
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to admin panel
      await router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error redirecting to admin:', error);
      setState(prev => ({ ...prev, redirecting: false }));
    }
  };

  const forceAdminRedirect = async () => {
    if (state.isAutoAdmin) {
      await autoRedirectToAdmin();
    }
  };

  const disableAutoRedirect = () => {
    // Store preference to disable auto-redirect
    localStorage.setItem('disable_auto_admin_redirect', 'true');
    setState(prev => ({ ...prev, redirecting: false }));
  };

  const enableAutoRedirect = () => {
    localStorage.removeItem('disable_auto_admin_redirect');
  };

  const shouldAutoRedirect = () => {
    return state.isAutoAdmin && 
           state.adminUser?.email === 'bknglabs.dev@gmail.com' &&
           !localStorage.getItem('disable_auto_admin_redirect') &&
           !state.redirecting;
  };

  return {
    ...state,
    checkAutoAdminStatus,
    autoRedirectToAdmin,
    forceAdminRedirect,
    disableAutoRedirect,
    enableAutoRedirect,
    shouldAutoRedirect,
    isAdmin: state.isAutoAdmin,
    loading: state.isLoading,
    redirecting: state.redirecting
  };
}

/**
 * Auto-Admin Welcome Component
 * Shows welcome message for auto-admin users
 */
export function AutoAdminWelcome({ adminEmail = 'bknglabs.dev@gmail.com' }) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkWelcome = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === adminEmail) {
        const hasSeenWelcome = localStorage.getItem(`welcome_${user.email}`);
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
      }
    };
    checkWelcome();
  }, [adminEmail]);

  const handleWelcomeDismissed = () => {
    localStorage.setItem(`welcome_${adminEmail}`, 'true');
    setShowWelcome(false);
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 rounded-full p-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">👑 Welcome, Auto-Admin!</h3>
            <p className="text-sm opacity-90">
              You've been automatically granted super administrator access
            </p>
          </div>
        </div>
        <button
          onClick={handleWelcomeDismissed}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
        >
          Continue to Admin Panel
        </button>
      </div>
    </div>
  );
}

/**
 * Admin Protection Component
 * Protects routes and redirects auto-admins appropriately
 */
interface AdminProtectionProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectToAdmin?: boolean;
  showWelcome?: boolean;
}

export function AdminProtection({ 
  children, 
  requireAdmin = false, 
  redirectToAdmin = true,
  showWelcome = true 
}: AdminProtectionProps) {
  const { isAutoAdmin, isLoading, shouldAutoRedirect } = useAutoAdmin();

  useEffect(() => {
    if (!isLoading && isAutoAdmin && redirectToAdmin && shouldAutoRedirect()) {
      // Auto-redirect will be handled by the useAutoAdmin hook
    }
  }, [isAutoAdmin, isLoading, redirectToAdmin, shouldAutoRedirect]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Require admin access
  if (requireAdmin && !isAutoAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <strong className="font-bold">Access Denied</strong>
            <span className="block sm:inline"> Administrator privileges required.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcome && isAutoAdmin && <AutoAdminWelcome />}
      {children}
    </>
  );
}

export default useAutoAdmin;