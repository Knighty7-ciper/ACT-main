/**
 * Sentry Client Configuration for Next.js
 * Enterprise-grade error monitoring and performance tracking
 * 
 * Organization: metasapien9-5z
 * Project: javascript-nextjs
 * DSN: https://968a09e07ed83c61960e93256687c647@o4510258814648320.ingest.us.sentry.io/4510258816876544
 * 
 * Author: MiniMax Agent
 * Date: 2025-10-30
 */

import * as Sentry from '@sentry/nextjs';

// ========================================
// SENTRY INITIALIZATION
// ========================================

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://968a09e07ed83c61960e93256687c647@o4510258814648320.ingest.us.sentry.io/4510258816876544',
  
  // Performance monitoring
  _experiments: {
    enableLogs: true,
    enableProfiling: process.env.NODE_ENV === 'production',
    enablePerformance: true,
  },

  // Environment and release information
  environment: process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || '1.0.0',
  
  // Sample rates for performance and error sampling
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error collection
  beforeSend(event) {
    // Filter out common non-actionable errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error) {
        const message = error.value?.toLowerCase() || '';
        
        // Skip network errors that are likely temporary
        if (message.includes('network error') || message.includes('failed to fetch')) {
          return null;
        }
        
        // Skip permission errors
        if (message.includes('permission denied') && message.includes('geolocation')) {
          return null;
        }
      }
    }
    
    return event;
  },

  // Additional integrations for enhanced monitoring
  integrations: [
    // Capture console logs as breadcrumbs
    Sentry.consoleLoggingIntegration({ 
      levels: ['log', 'warn', 'error', 'info'] 
    }),
    
    // Capture unhandled promise rejections
    Sentry.unhandledRejectionIntegration(),
    
    // Capture browser errors
    Sentry.browserErrorIntegration({
      captureUncaught: true,
      captureUnhandledRejections: true
    }),
    
    // Session tracking for user experience monitoring
    Sentry.sessionTimingIntegration(),
  ],

  // Custom tags for better organization
  initialScope: {
    tags: {
      component: 'frontend',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },
  },

  // Ignore specific error patterns
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error.',
    'Non-Error promise rejection captured'
  ],

  // Deduplication
  maxValueLength: 250,

  // User context configuration
  sendDefaultPii: process.env.NODE_ENV === 'production',

  // Sample rates
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// ========================================
// ERROR MONITORING UTILITIES
// ========================================

/**
 * Capture React errors with component context
 */
export const captureReactError = (
  error: Error, 
  errorInfo: any, 
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'react');
    scope.setContext('react_error_info', errorInfo);
    
    if (context) {
      scope.setContext('error_context', context);
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Capture API errors with request context
 */
export const captureApiError = (
  error: Error,
  request: Request,
  response?: Response,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'api');
    scope.setContext('request', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
    });
    
    if (response) {
      scope.setContext('response', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }
    
    if (context) {
      scope.setContext('api_context', context);
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Capture payment errors with transaction context
 */
export const capturePaymentError = (
  error: Error,
  paymentData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'payment');
    scope.setTag('transaction_type', 'payment');
    
    scope.setContext('payment_data', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
      orderId: paymentData.orderId,
    });
    
    if (context) {
      scope.setContext('payment_context', context);
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Capture admin operation errors
 */
export const captureAdminError = (
  error: Error,
  operation: string,
  adminData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'admin');
    scope.setTag('operation_type', operation);
    
    scope.setContext('admin_operation', {
      operation,
      adminId: adminData.adminId,
      targetUserId: adminData.targetUserId,
      action: adminData.action,
    });
    
    if (context) {
      scope.setContext('admin_context', context);
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Performance monitoring for React components
 */
export const withErrorBoundary = (
  WrappedComponent: React.ComponentType<any>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) => {
  return Sentry.withErrorBoundary(WrappedComponent, {
    fallback: fallback || ((props) => (
      <div className="error-boundary-fallback">
        <h2>Something went wrong</h2>
        <button onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    )),
  });
};

/**
 * Monitor component performance
 */
export const withPerformanceTracking = <T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) => {
  return Sentry.withProfiler(WrappedComponent, {
    name: componentName,
  });
};

/**
 * Log user actions for debugging
 */
export const logUserAction = (
  action: string,
  properties?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message: `User action: ${action}`,
    category: 'user_action',
    level: 'info',
    data: properties,
  });
};

/**
 * Log API calls as breadcrumbs
 */
export const logApiCall = (
  endpoint: string,
  method: string,
  status?: number,
  duration?: number
) => {
  Sentry.addBreadcrumb({
    message: `API call: ${method} ${endpoint}`,
    category: 'api',
    level: 'info',
    data: {
      endpoint,
      method,
      status,
      duration,
    },
  });
};

/**
 * Log payment transactions
 */
export const logPaymentTransaction = (
  action: string,
  data: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message: `Payment transaction: ${action}`,
    category: 'payment',
    level: 'info',
    data,
  });
};

/**
 * Set user context for better error tracking
 */
export const setSentryUser = (user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}) => {
  Sentry.setUser(user);
  
  Sentry.setContext('user_profile', {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// ========================================
// COMPONENT WRAPPER EXPORTS
// ========================================

export default Sentry;

// Export utility functions
export {
  captureReactError,
  captureApiError,
  capturePaymentError,
  captureAdminError,
  withErrorBoundary,
  withPerformanceTracking,
  logUserAction,
  logApiCall,
  logPaymentTransaction,
  setSentryUser,
  clearSentryUser,
};