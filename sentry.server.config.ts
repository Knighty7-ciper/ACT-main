/**
 * Sentry Server Configuration for Next.js
 * Enterprise-grade server-side error monitoring
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
// SENTRY SERVER INITIALIZATION
// ========================================

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://968a09e07ed83c61960e93256687c647@o4510258814648320.ingest.us.sentry.io/4510258816876544',
  
  // Environment and release information
  environment: process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || '1.0.0',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Server-specific configuration
  enableTracing: true,
  enablePerformance: true,
  enableProfiling: process.env.NODE_ENV === 'production',
  
  // Error filtering and processing
  beforeSend(event, hint) {
    // Server-side error filtering
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error) {
        const message = error.value?.toLowerCase() || '';
        const type = error.type?.toLowerCase() || '';
        
        // Skip common non-actionable errors
        if (
          message.includes('connection refused') ||
          message.includes('econnreset') ||
          message.includes('timeout') ||
          type.includes('timeout')
        ) {
          return null;
        }
        
        // Skip hot module replacement errors in development
        if (process.env.NODE_ENV === 'development' && 
            message.includes('hmr') || 
            message.includes('hot module replacement')) {
          return null;
        }
      }
    }
    
    return event;
  },

  // Enhanced integrations for server monitoring
  integrations: [
    // Capture Node.js errors
    Sentry.nodeErrorIntegration(),
    
    // Capture unhandled promise rejections
    Sentry.unhandledRejectionIntegration(),
    
    // Capture console logs
    Sentry.consoleLoggingIntegration({
      levels: ['log', 'warn', 'error', 'info']
    }),
    
    // Capture HTTP requests
    Sentry.httpIntegration(),
    
    // Capture database queries
    Sentry.prismaIntegration(),
    
    // Capture Express middleware errors
    Sentry.expressIntegration(),
    
    // Session tracking
    Sentry.sessionTimingIntegration(),
  ],

  // Custom tags for server context
  initialScope: {
    tags: {
      component: 'server',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.SENTRY_RELEASE || '1.0.0',
    },
  },

  // Ignore specific error patterns
  ignoreErrors: [
    'Non-Error promise rejection captured',
    'Script error.',
    'ResizeObserver loop limit exceeded',
  ],

  // Maximum character limit for error messages
  maxValueLength: 1000,

  // Request isolation for better error tracking
  beforeSendTransaction(event, hint) {
    // Add request metadata to transactions
    if (event.transaction) {
      const request = hint?.request;
      if (request) {
        event.extra = {
          ...event.extra,
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers?.entries() || []),
          query: request.query,
        };
      }
    }
    
    return event;
  },

  // Capture request bodies for debugging (excluding sensitive data)
  beforeBreadcrumb(breadcrumb, hint) {
    // Don't log sensitive information
    if (breadcrumb.category === 'http' && breadcrumb.data) {
      const url = breadcrumb.data.url || '';
      
      // Skip sensitive endpoints
      if (
        url.includes('/api/auth') ||
        url.includes('/api/admin') ||
        url.includes('/payment') ||
        url.includes('/kyc')
      ) {
        breadcrumb.data.sensitive = true;
        breadcrumb.data.url = '[REDACTED]';
      }
    }
    
    return breadcrumb;
  },
});

// ========================================
// ERROR CAPTURE UTILITIES
// ========================================

/**
 * Capture backend API errors
 */
export const captureApiError = (
  error: Error,
  request: any,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'api');
    scope.setTag('component', 'backend');
    
    scope.setContext('request', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers?.entries() || []),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
    
    scope.setContext('api_context', context || {});
    
    Sentry.captureException(error);
  });
};

/**
 * Capture database errors
 */
export const captureDatabaseError = (
  error: Error,
  query: string,
  parameters?: any,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'database');
    scope.setTag('component', 'backend');
    
    scope.setContext('database', {
      query: query.substring(0, 200), // Limit query length
      parameters,
      database: process.env.DATABASE_NAME || 'unknown',
    });
    
    scope.setContext('database_context', context || {});
    
    Sentry.captureException(error);
  });
};

/**
 * Capture payment processing errors
 */
export const capturePaymentError = (
  error: Error,
  paymentData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'payment');
    scope.setTag('component', 'backend');
    
    // Sanitize payment data
    const sanitizedData = {
      ...paymentData,
      cardNumber: paymentData.cardNumber ? '***' : undefined,
      cvv: paymentData.cvv ? '***' : undefined,
      secretKey: paymentData.secretKey ? '***' : undefined,
    };
    
    scope.setContext('payment_data', sanitizedData);
    scope.setContext('payment_context', context || {});
    
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
    scope.setTag('component', 'backend');
    scope.setTag('operation_type', operation);
    
    scope.setContext('admin_operation', {
      operation,
      adminId: adminData.adminId,
      targetUserId: adminData.targetUserId,
      adminEmail: adminData.adminEmail,
      action: adminData.action,
    });
    
    scope.setContext('admin_context', context || {});
    
    Sentry.captureException(error);
  });
};

/**
 * Capture blockchain/Stellar errors
 */
export const captureBlockchainError = (
  error: Error,
  operation: string,
  blockchainData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'blockchain');
    scope.setTag('component', 'backend');
    scope.setTag('operation_type', operation);
    
    scope.setContext('blockchain_operation', {
      operation,
      network: blockchainData.network || 'testnet',
      publicKey: blockchainData.publicKey,
      transactionHash: blockchainData.transactionHash,
      amount: blockchainData.amount,
    });
    
    scope.setContext('blockchain_context', context || {});
    
    Sentry.captureException(error);
  });
};

/**
 * Capture authentication errors
 */
export const captureAuthError = (
  error: Error,
  authData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'authentication');
    scope.setTag('component', 'backend');
    
    scope.setContext('auth_data', {
      email: authData.email ? `${authData.email.substring(0, 3)}***` : undefined,
      userId: authData.userId,
      authMethod: authData.authMethod,
    });
    
    scope.setContext('auth_context', context || {});
    
    Sentry.captureException(error);
  });
};

// ========================================
// PERFORMANCE MONITORING
// ========================================

/**
 * Track API endpoint performance
 */
export const trackApiPerformance = (
  endpoint: string,
  method: string,
  startTime: number
) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  Sentry.addBreadcrumb({
    message: `API Performance: ${method} ${endpoint}`,
    category: 'performance',
    level: 'info',
    data: {
      endpoint,
      method,
      duration,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Alert on slow endpoints
  if (duration > 5000) { // 5 seconds
    Sentry.captureMessage(`Slow API endpoint: ${method} ${endpoint} took ${duration}ms`, 'warning');
  }
};

/**
 * Track database query performance
 */
export const trackDatabasePerformance = (
  query: string,
  startTime: number,
  rowCount?: number
) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  Sentry.addBreadcrumb({
    message: `Database Performance: ${query.substring(0, 100)}...`,
    category: 'performance',
    level: 'info',
    data: {
      query: query.substring(0, 200),
      duration,
      rowCount,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Alert on slow queries
  if (duration > 2000) { // 2 seconds
    Sentry.captureMessage(`Slow database query took ${duration}ms`, 'warning');
  }
};

/**
 * Track external API performance
 */
export const trackExternalApiPerformance = (
  api: string,
  endpoint: string,
  startTime: number,
  statusCode?: number
) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  Sentry.addBreadcrumb({
    message: `External API: ${api} ${endpoint}`,
    category: 'performance',
    level: 'info',
    data: {
      api,
      endpoint,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Alert on slow external API calls
  if (duration > 10000) { // 10 seconds
    Sentry.captureMessage(`Slow external API: ${api} took ${duration}ms`, 'warning');
  }
};

// ========================================
// CONTEXT HELPERS
// ========================================

/**
 * Set user context for server-side tracking
 */
export const setServerUserContext = (user: {
  id: string;
  email?: string;
  role?: string;
  adminId?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  
  Sentry.setContext('user_profile', {
    id: user.id,
    email: user.email,
    role: user.role,
    adminId: user.adminId,
  });
};

/**
 * Set request context
 */
export const setRequestContext = (request: any) => {
  Sentry.setContext('request', {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.get('user-agent'),
    headers: Object.fromEntries(request.headers?.entries() || []),
  });
};

/**
 * Set database context
 */
export const setDatabaseContext = (database: string, operation: string) => {
  Sentry.setContext('database', {
    name: database,
    operation,
    timestamp: new Date().toISOString(),
  });
};

export default Sentry;