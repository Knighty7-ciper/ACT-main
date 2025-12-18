/**
 * Sentry Edge Configuration for Next.js
 * Enterprise-grade edge runtime error monitoring
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
// SENTRY EDGE INITIALIZATION
// ========================================

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://968a09e07ed83c61960e93256687c647@o4510258814648320.ingest.us.sentry.io/4510258816876544',
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || '1.0.0',
  
  // Performance monitoring for edge functions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
  
  // Edge-specific optimizations
  enableTracing: true,
  enablePerformance: true,
  enableProfiling: false, // Profiling not available in edge runtime
  
  // Error filtering for edge environment
  beforeSend(event, hint) {
    // Edge runtime specific error filtering
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error) {
        const message = error.value?.toLowerCase() || '';
        const type = error.type?.toLowerCase() || '';
        
        // Skip edge-specific non-actionable errors
        if (
          message.includes('worker') ||
          message.includes('edge runtime') ||
          message.includes('fetch') && message.includes('network') ||
          type.includes('typeerror') && message.includes('function')
        ) {
          return null;
        }
        
        // Skip connection timeouts (common in edge)
        if (message.includes('timeout') || message.includes('aborted')) {
          return null;
        }
      }
    }
    
    return event;
  },

  // Minimal integrations for edge runtime
  integrations: [
    // Browser errors (for client-side edge functions)
    Sentry.browserErrorIntegration({
      captureUncaught: true,
      captureUnhandledRejections: false, // Handled by Node.js
    }),
    
    // Console logging
    Sentry.consoleLoggingIntegration({
      levels: ['error', 'warn', 'info']
    }),
  ],

  // Edge-specific tags
  initialScope: {
    tags: {
      component: 'edge',
      runtime: 'edge',
      environment: process.env.NODE_ENV || 'development',
    },
  },

  // Simplified error patterns
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error.',
    'Failed to fetch',
    'Network request failed',
  ],

  // Character limits for edge environment
  maxValueLength: 500,

  // Breadcrumb configuration for edge
  beforeBreadcrumb(breadcrumb, hint) {
    // Sanitize breadcrumbs for edge context
    if (breadcrumb.category === 'http' && breadcrumb.data) {
      // Remove sensitive headers and URLs
      breadcrumb.data = {
        ...breadcrumb.data,
        url: '[REDACTED]',
        headers: '[REDACTED]',
      };
    }
    
    return breadcrumb;
  },

  // Transaction sampling for edge
  beforeSendTransaction(event, hint) {
    // Keep only important edge transactions
    const transactionName = event.transaction || '';
    
    // Only keep high-priority edge functions
    const importantEdgeFunctions = [
      '/api/auth',
      '/api/payment',
      '/api/admin',
      '/api/webhook',
      '/api/kyc',
    ];
    
    const isImportant = importantEdgeFunctions.some(func => 
      transactionName.includes(func)
    );
    
    if (!isImportant && transactionName.includes('/api/')) {
      return null;
    }
    
    return event;
  },
});

// ========================================
// EDGE-SPECIFIC ERROR UTILITIES
// ========================================

/**
 * Capture edge function errors
 */
export const captureEdgeError = (
  error: Error,
  functionName: string,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'edge_function');
    scope.setTag('component', 'edge');
    scope.setTag('function_name', functionName);
    
    scope.setContext('edge_context', {
      functionName,
      runtime: 'edge',
      timestamp: new Date().toISOString(),
      ...context,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Capture edge API errors
 */
export const captureEdgeApiError = (
  error: Error,
  request: Request,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'edge_api');
    scope.setTag('component', 'edge');
    
    scope.setContext('edge_request', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString(),
    });
    
    scope.setContext('edge_api_context', context || {});
    
    Sentry.captureException(error);
  });
};

/**
 * Capture edge webhook errors
 */
export const captureEdgeWebhookError = (
  error: Error,
  webhookData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'edge_webhook');
    scope.setTag('component', 'edge');
    scope.setTag('webhook_type', webhookData.type || 'unknown');
    
    scope.setContext('edge_webhook', {
      type: webhookData.type,
      source: webhookData.source,
      timestamp: new Date().toISOString(),
      data: webhookData.data,
    });
    
    scope.setContext('edge_webhook_context', context || {});
    
    Sentry.captureException(error);
  });
};

/**
 * Capture edge authentication errors
 */
export const captureEdgeAuthError = (
  error: Error,
  authData: Record<string, any>,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_source', 'edge_auth');
    scope.setTag('component', 'edge');
    
    scope.setContext('edge_auth', {
      authMethod: authData.method || 'unknown',
      userAgent: authData.userAgent,
      ip: authData.ip,
      timestamp: new Date().toISOString(),
    });
    
    scope.setContext('edge_auth_context', context || {});
    
    Sentry.captureException(error);
  });
};

// ========================================
// EDGE PERFORMANCE MONITORING
// ========================================

/**
 * Track edge function performance
 */
export const trackEdgePerformance = (
  functionName: string,
  startTime: number,
  endTime?: number
) => {
  const finalEndTime = endTime || Date.now();
  const duration = finalEndTime - startTime;
  
  Sentry.addBreadcrumb({
    message: `Edge Performance: ${functionName}`,
    category: 'performance',
    level: 'info',
    data: {
      functionName,
      duration,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Alert on slow edge functions
  if (duration > 10000) { // 10 seconds for edge functions
    Sentry.captureMessage(
      `Slow edge function: ${functionName} took ${duration}ms`, 
      'warning'
    );
  }
};

/**
 * Track edge API performance
 */
export const trackEdgeApiPerformance = (
  endpoint: string,
  method: string,
  startTime: number
) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  Sentry.addBreadcrumb({
    message: `Edge API Performance: ${method} ${endpoint}`,
    category: 'performance',
    level: 'info',
    data: {
      endpoint,
      method,
      duration,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Alert on slow edge API calls
  if (duration > 5000) { // 5 seconds
    Sentry.captureMessage(
      `Slow edge API: ${method} ${endpoint} took ${duration}ms`, 
      'warning'
    );
  }
};

// ========================================
// EDGE CONTEXT HELPERS
// ========================================

/**
 * Set edge context for better error tracking
 */
export const setEdgeContext = (functionName: string, runtime: string = 'edge') => {
  Sentry.setContext('edge_function', {
    functionName,
    runtime,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Set request context for edge API
 */
export const setEdgeRequestContext = (request: Request) => {
  Sentry.setContext('edge_request', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Set user context for edge functions
 */
export const setEdgeUserContext = (user: {
  id: string;
  email?: string;
  role?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  
  Sentry.setContext('edge_user', {
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

// ========================================
// EDGE BREADCRUMB HELPERS
// ========================================

/**
 * Add edge operation breadcrumb
 */
export const addEdgeBreadcrumb = (
  operation: string,
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message: `Edge operation: ${operation}`,
    category: 'edge_operation',
    level: 'info',
    data: {
      operation,
      timestamp: new Date().toISOString(),
      ...data,
    },
  });
};

/**
 * Add edge API breadcrumb
 */
export const addEdgeApiBreadcrumb = (
  method: string,
  endpoint: string,
  statusCode?: number,
  duration?: number
) => {
  Sentry.addBreadcrumb({
    message: `Edge API: ${method} ${endpoint}`,
    category: 'edge_api',
    level: 'info',
    data: {
      method,
      endpoint,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
    },
  });
};

export default Sentry;