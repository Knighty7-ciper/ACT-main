/**
 * Secure Production Logger
 * Replaces console.log with environment-aware, secure logging
 * Prevents sensitive data exposure in production logs
 * 
 * Features:
 * - Environment-based logging levels
 * - Sensitive data filtering
 * - Structured logging format
 * - Performance optimized
 * 
 * Author: MiniMax Agent
 * Date: 2025-10-31
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  service?: string;
  userId?: string;
  transactionId?: string;
  orderId?: string;
  correlationId?: string;
}

export interface SecureLogOptions {
  level?: LogLevel;
  context?: LogContext;
  sensitiveKeys?: string[];
  includeStack?: boolean;
}

class SecureLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel = process.env.LOG_LEVEL || (this.isProduction ? LogLevel.WARN : LogLevel.INFO);
  private serviceName = process.env.SERVICE_NAME || 'ACT-Platform';

  private sensitiveKeys = [
    'password', 'secret', 'token', 'key', 'authorization', 
    'api_key', 'private_key', 'card', 'cvv', 'ssn',
    'email', 'phone', 'amount', 'balance'
  ];

  private shouldLog(level: LogLevel): boolean {
    const levelHierarchy = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1, 
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3
    };
    
    const currentLevelIndex = levelHierarchy[logLevelAsEnum(this.logLevel)];
    const messageLevelIndex = levelHierarchy[level];
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private sanitizeData(data: any, sensitiveKeys: string[] = this.sensitiveKeys): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item, sensitiveKeys));
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value, sensitiveKeys);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private formatMessage(level: LogLevel, message: string, data?: any, options?: SecureLogOptions): string {
    const timestamp = new Date().toISOString();
    const service = options?.context?.service || this.serviceName;
    const context = options?.context;
    
    // Build structured log
    const logParts = [
      `[${timestamp}]`,
      `[${service}]`,
      `[${level.toUpperCase()}]`,
      message
    ];

    // Add context if provided
    if (context) {
      const contextStr = Object.entries(context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}:${value}`)
        .join(' ');
      
      if (contextStr) {
        logParts.push(`[${contextStr}]`);
      }
    }

    // Add sanitized data if provided
    if (data !== undefined) {
      const sanitizedData = this.sanitizeData(data, options?.sensitiveKeys);
      logParts.push(`Data: ${JSON.stringify(sanitizedData)}`);
    }

    return logParts.filter(part => part).join(' ');
  }

  public error(message: string, data?: any, options?: SecureLogOptions): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, data, options);
    
    if (this.isProduction) {
      // Use process.stderr for production
      process.stderr.write(formattedMessage + '\n');
    } else {
      console.error('🔴', formattedMessage);
    }
  }

  public warn(message: string, data?: any, options?: SecureLogOptions): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, data, options);
    
    if (this.isProduction) {
      process.stderr.write(formattedMessage + '\n');
    } else {
      console.warn('🟡', formattedMessage);
    }
  }

  public info(message: string, data?: any, options?: SecureLogOptions): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, data, options);
    
    if (this.isProduction) {
      process.stdout.write(formattedMessage + '\n');
    } else {
      console.log('🔵', formattedMessage);
    }
  }

  public debug(message: string, data?: any, options?: SecureLogOptions): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, data, options);
    console.log('🟢', formattedMessage);
  }

  // Convenience methods for payment service
  public paymentError(message: string, orderId?: string, error?: any): void {
    this.error(message, error, {
      context: { 
        service: 'PaymentService',
        orderId: orderId || 'unknown'
      }
    });
  }

  public paymentInfo(message: string, orderId?: string, data?: any): void {
    this.info(message, data, {
      context: { 
        service: 'PaymentService',
        orderId: orderId || 'unknown'
      }
    });
  }

  public paymentDebug(message: string, orderId?: string, data?: any): void {
    this.debug(message, data, {
      context: { 
        service: 'PaymentService',
        orderId: orderId || 'unknown'
      }
    });
  }

  // Security event logging
  public securityEvent(message: string, userId?: string, data?: any): void {
    this.warn(message, data, {
      context: { 
        service: 'SecurityService',
        userId: userId || 'anonymous'
      }
    });
  }
}

// Helper function to convert string log level to enum
function logLevelAsEnum(level: string): LogLevel {
  switch (level.toLowerCase()) {
    case 'error': return LogLevel.ERROR;
    case 'warn': return LogLevel.WARN;
    case 'info': return LogLevel.INFO;
    case 'debug': return LogLevel.DEBUG;
    default: return LogLevel.INFO;
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger();

// Convenience exports
export const log = {
  error: (message: string, data?: any, options?: SecureLogOptions) => secureLogger.error(message, data, options),
  warn: (message: string, data?: any, options?: SecureLogOptions) => secureLogger.warn(message, data, options),
  info: (message: string, data?: any, options?: SecureLogOptions) => secureLogger.info(message, data, options),
  debug: (message: string, data?: any, options?: SecureLogOptions) => secureLogger.debug(message, data, options),
  
  // Payment-specific methods
  paymentError: (message: string, orderId?: string, error?: any) => secureLogger.paymentError(message, orderId, error),
  paymentInfo: (message: string, orderId?: string, data?: any) => secureLogger.paymentInfo(message, orderId, data),
  paymentDebug: (message: string, orderId?: string, data?: any) => secureLogger.paymentDebug(message, orderId, data),
  
  // Security events
  security: (message: string, userId?: string, data?: any) => secureLogger.securityEvent(message, userId, data)
};

export default secureLogger;