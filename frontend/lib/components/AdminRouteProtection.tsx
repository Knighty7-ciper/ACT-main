/**
 * Admin Route Protection Component
 * 
 * Protects admin routes and ensures only authorized users can access them.
 * Integrates with Supabase Auth and admin role verification.
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  full_name?: string;
}

interface AdminRouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

const AdminRouteProtection: React.FC<AdminRouteProtectionProps> = ({
  children,
  requiredRole = 'admin',
  requiredPermissions = [],
  fallback
}) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [requiredRole, requiredPermissions]);

  const checkAdminAccess = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setHasAccess(false);
        setAdminUser(null);
        return;
      }

      // Get user profile to check admin role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, email, full_name, admin_permissions')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        setHasAccess(false);
        setAdminUser(null);
        return;
      }

      // Check if user has required admin role
      const hasRequiredRole = ['admin', 'super_admin'].includes(profile.role);

      if (!hasRequiredRole) {
        setHasAccess(false);
        setAdminUser(null);
        return;
      }

      // Check role hierarchy
      const roleHierarchy = {
        'admin': 1,
        'super_admin': 2
      };

      const userRoleLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 1;

      if (userRoleLevel < requiredRoleLevel) {
        setHasAccess(false);
        setAdminUser(null);
        return;
      }

      // Check required permissions
      const userPermissions = profile.admin_permissions || [];
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission) || profile.role === 'super_admin'
      );

      if (!hasRequiredPermissions) {
        setHasAccess(false);
        setAdminUser(null);
        return;
      }

      // User has access
      const adminUser: AdminUser = {
        id: user.id,
        email: profile.email,
        role: profile.role,
        permissions: userPermissions,
        full_name: profile.full_name
      };

      setAdminUser(adminUser);
      setHasAccess(true);

      // Log admin access
      await logAdminAccess(user.id, 'admin_access', 'Admin route accessed', {
        route: window.location.pathname,
        required_role: requiredRole,
        required_permissions: requiredPermissions
      });

    } catch (error) {
      console.error('Admin access check error:', error);
      setHasAccess(false);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logAdminAccess = async (
    adminUserId: string,
    actionType: string,
    description: string,
    metadata: any = {}
  ) => {
    try {
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: adminUserId,
          action_type: actionType,
          action_description: description,
          metadata: {
            ...metadata,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          },
          ip_address: null, // This would come from server-side
        });
    } catch (error) {
      console.error('Failed to log admin access:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // No access state
  if (!hasAccess || !adminUser) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <span className="text-4xl">🚫</span>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You don't have permission to access this area.
            </p>
            <p className="mt-1 text-center text-sm text-gray-500">
              Required role: {requiredRole}
              {requiredPermissions.length > 0 && (
                <span> • Required permissions: {requiredPermissions.join(', ')}</span>
              )}
            </p>
          </div>
          
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-sm font-medium text-red-800">Security Notice</h3>
                  <p className="mt-1 text-sm text-red-700">
                    This is a protected admin area. Unauthorized access attempts are logged.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.history.back()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has access - render children with admin context
  return (
    <AdminContext.Provider value={adminUser}>
      <AdminActivityTracker adminUser={adminUser} />
      {children}
    </AdminContext.Provider>
  );
};

// Admin Context for sharing admin user info
const AdminContext = React.createContext<AdminUser | null>(null);

// Hook to use admin context
export const useAdmin = (): AdminUser | null => {
  return React.useContext(AdminContext);
};

// Admin Activity Tracker Component
interface AdminActivityTrackerProps {
  adminUser: AdminUser;
}

const AdminActivityTracker: React.FC<AdminActivityTrackerProps> = ({ adminUser }) => {
  useEffect(() => {
    // Track page view
    const trackPageView = () => {
      // This would send page view analytics
      console.log('Admin page view:', window.location.pathname);
    };

    trackPageView();

    // Track time spent
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      // Log time spent on page
      console.log('Time spent on admin page:', timeSpent, 'ms');
    };
  }, []);

  return null; // This component doesn't render anything
};

// HOC for protecting admin pages
export const withAdminProtection = (
  Component: React.ComponentType<any>,
  options: {
    requiredRole?: 'admin' | 'super_admin';
    requiredPermissions?: string[];
  } = {}
) => {
  return (props: any) => (
    <AdminRouteProtection {...options}>
      <Component {...props} />
    </AdminRouteProtection>
  );
};

// Permission checker hook
export const useAdminPermissions = () => {
  const adminUser = useAdmin();

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;
    
    return adminUser.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!adminUser) return false;
    
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;
    
    return permissions.some(permission => adminUser.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!adminUser) return false;
    
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;
    
    return permissions.every(permission => adminUser.permissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin: adminUser?.role === 'super_admin',
    adminUser
  };
};

// Permission guard component
interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Role guard component
interface RoleGuardProps {
  roles: ('admin' | 'super_admin')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null
}) => {
  const { adminUser } = useAdminPermissions();

  if (!adminUser || !roles.includes(adminUser.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AdminRouteProtection;