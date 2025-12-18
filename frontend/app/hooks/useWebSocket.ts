/**
 * ARKHAM Phase 1: Real-Time Madness
 * React Hook for WebSocket Integration
 * 
 * Provides easy-to-use hooks for React components:
 * - Connection management
 * - Event subscriptions
 * - Real-time data updates
 * - Admin dashboard integration
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WebSocketClient, 
  WebSocketConfig, 
  SystemHealth, 
  TransactionEvent,
  getWebSocketClient,
  initializeWebSocket,
  disconnectWebSocket 
} from '../services/websocket-client';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  channels?: string[];
  adminMode?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
}

interface WebSocketActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (channel: string) => Promise<boolean>;
  unsubscribe: (channel: string) => Promise<boolean>;
  sendToChannel: (channel: string, message: any, priority?: 'low' | 'normal' | 'high' | 'urgent') => Promise<boolean>;
  updateAuth: (auth: { userId?: string; adminId?: string; role?: 'user' | 'admin' | 'system' }) => void;
}

/**
 * Main WebSocket hook for general use
 */
export function useWebSocket(
  config: WebSocketConfig, 
  options: UseWebSocketOptions = {}
): WebSocketState & WebSocketActions & { client: WebSocketClient | null } {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const clientRef = useRef<WebSocketClient | null>(null);

  // Initialize client
  useEffect(() => {
    try {
      clientRef.current = initializeWebSocket(config);
      
      // Set up connection status listeners
      clientRef.current.onConnectionStatusChange((status) => {
        setIsConnected(status === 'connected');
        setIsConnecting(status === 'connecting');
        setConnectionError(status === 'error' ? 'Connection failed' : null);
      });

      // Auto-connect if requested
      if (options.autoConnect !== false) {
        connect();
      }

      return () => {
        disconnect();
      };
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to initialize');
    }
  }, [config.url]);

  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      setIsConnecting(true);
      setConnectionError(null);
      await clientRef.current.connect();

      // Subscribe to default channels
      if (options.channels) {
        for (const channel of options.channels) {
          await clientRef.current.subscribe(channel);
        }
      }

      // Subscribe to admin events if needed
      if (options.adminMode) {
        await clientRef.current.subscribeToAdmin();
      }

    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [options.channels, options.adminMode]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  const subscribe = useCallback(async (channel: string): Promise<boolean> => {
    if (!clientRef.current) return false;
    return await clientRef.current.subscribe(channel);
  }, []);

  const unsubscribe = useCallback(async (channel: string): Promise<boolean> => {
    if (!clientRef.current) return false;
    return await clientRef.current.unsubscribe(channel);
  }, []);

  const sendToChannel = useCallback(async (
    channel: string, 
    message: any, 
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<boolean> => {
    if (!clientRef.current) return false;
    return await clientRef.current.sendToChannel(channel, message, priority);
  }, []);

  const updateAuth = useCallback((auth: { userId?: string; adminId?: string; role?: 'user' | 'admin' | 'system' }) => {
    if (clientRef.current) {
      clientRef.current.updateAuth(auth);
    }
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts: 0, // TODO: Track this
    
    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendToChannel,
    updateAuth,
    
    // Client reference
    client: clientRef.current
  };
}

/**
 * Hook for admin dashboard real-time updates
 */
export function useAdminWebSocket(config: WebSocketConfig) {
  const ws = useWebSocket(config, { 
    autoConnect: true, 
    adminMode: true,
    channels: [
      'admin:dashboard',
      'admin:alerts',
      'admin:users',
      'admin:transactions',
      'admin:system'
    ]
  });

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionEvent[]>([]);

  useEffect(() => {
    if (!ws.client) return;

    // Dashboard updates
    ws.client.onAdminDashboardUpdate((data) => {
      setDashboardData(data);
    });

    // System alerts
    ws.client.onSystemAlert((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
    });

    // System health
    ws.client.onSystemHealthUpdate((health) => {
      setSystemHealth(health);
    });

    // Recent transactions
    ws.client.onTransactionEvent((event) => {
      setRecentTransactions(prev => [event, ...prev].slice(0, 100)); // Keep last 100 transactions
    });

    return () => {
      // Cleanup handled by main hook
    };
  }, [ws.client]);

  return {
    ...ws,
    dashboardData,
    alerts,
    systemHealth,
    recentTransactions
  };
}

/**
 * Hook for user notifications and updates
 */
export function useUserWebSocket(config: WebSocketConfig, userId?: string) {
  const ws = useWebSocket(config, { 
    autoConnect: true,
    channels: [
      'user:notifications',
      'user:transactions',
      'exchange-rates'
    ]
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<TransactionEvent[]>([]);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  useEffect(() => {
    if (!ws.client || !userId) return;

    // User notifications
    ws.client.onUserNotification((notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    // User-specific transactions
    ws.client.onTransactionEvent((event) => {
      if (event.userId === userId) {
        setUserTransactions(prev => [event, ...prev].slice(0, 50));
      }
    });

    // Exchange rate updates
    ws.client.onExchangeRateUpdate((data) => {
      setExchangeRates(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(rate => rate.pair === data.pair);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = data;
        } else {
          updated.push(data);
        }
        
        return updated.slice(0, 20); // Keep last 20 currency pairs
      });
    });

    return () => {
      // Cleanup handled by main hook
    };
  }, [ws.client, userId]);

  return {
    ...ws,
    notifications,
    userTransactions,
    exchangeRates
  };
}

/**
 * Hook for ACT token price monitoring
 */
export function useActTokenWebSocket(config: WebSocketConfig) {
  const ws = useWebSocket(config, { 
    autoConnect: true,
    channels: ['act-token']
  });

  const [actPrice, setActPrice] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!ws.client) return;

    ws.client.onActPriceUpdate((data) => {
      setActPrice(data);
      setPriceHistory(prev => [...prev, { ...data, timestamp: new Date() }].slice(0, 100));
    });

    return () => {
      // Cleanup handled by main hook
    };
  }, [ws.client]);

  return {
    ...ws,
    actPrice,
    priceHistory
  };
}

/**
 * Hook for system monitoring (admin only)
 */
export function useSystemMonitorWebSocket(config: WebSocketConfig) {
  const ws = useWebSocket(config, { 
    autoConnect: true, 
    adminMode: true,
    channels: [
      'admin:dashboard',
      'system:health',
      'system:alerts',
      'admin:alerts'
    ]
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});

  useEffect(() => {
    if (!ws.client) return;

    // System health monitoring
    ws.client.onSystemHealthUpdate((health) => {
      setSystemHealth(health);
    });

    // System alerts
    ws.client.on('system:alert', (alert) => {
      setSystemAlerts(prev => [alert, ...prev].slice(0, 100));
    });

    // Performance metrics (custom event)
    ws.client.on('system:performance', (metrics) => {
      setPerformanceMetrics(metrics);
    });

    return () => {
      // Cleanup handled by main hook
    };
  }, [ws.client]);

  return {
    ...ws,
    systemHealth,
    systemAlerts,
    performanceMetrics
  };
}

/**
 * Hook for real-time market data
 */
export function useMarketDataWebSocket(config: WebSocketConfig) {
  const ws = useWebSocket(config, { 
    autoConnect: true,
    channels: [
      'exchange-rates',
      'act-token',
      'market:significant_changes'
    ]
  });

  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [actPrice, setActPrice] = useState<any>(null);
  const [marketAlerts, setMarketAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!ws.client) return;

    // Exchange rates
    ws.client.onExchangeRateUpdate((data) => {
      setExchangeRates(prev => {
        const updated = [...prev];
        const index = updated.findIndex(rate => rate.pair === data.pair);
        
        if (index >= 0) {
          updated[index] = data;
        } else {
          updated.push(data);
        }
        
        return updated;
      });
    });

    // ACT token price
    ws.client.onActPriceUpdate((data) => {
      setActPrice(data);
    });

    // Market alerts
    ws.client.on('market:significant_change', (alert) => {
      setMarketAlerts(prev => [alert, ...prev].slice(0, 50));
    });

    return () => {
      // Cleanup handled by main hook
    };
  }, [ws.client]);

  return {
    ...ws,
    exchangeRates,
    actPrice,
    marketAlerts
  };
}

// ========================================
// UTILITY HOOKS
// ========================================

/**
 * Hook for connection status management
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastConnected, setLastConnected] = useState<Date | null>(null);

  useEffect(() => {
    const client = getWebSocketClient();
    if (client) {
      client.onConnectionStatusChange((newStatus) => {
        setStatus(newStatus);
        if (newStatus === 'connected') {
          setLastConnected(new Date());
        }
      });
    }
  }, []);

  return { status, lastConnected };
}

/**
 * Hook for real-time data persistence
 */
export function useRealtimeData<T>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`realtime_${key}`);
      return saved ? JSON.parse(saved) : initialValue;
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`realtime_${key}`, JSON.stringify(data));
    }
  }, [key, data]);

  return [data, setData] as const;
}