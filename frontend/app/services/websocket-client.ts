/**
 * ARKHAM Phase 1: Real-Time Madness
 * Frontend WebSocket Client Service
 * 
 * Provides real-time connectivity for the React frontend:
 * - Admin dashboard live updates
 * - User notifications and transaction updates
 * - System health monitoring
 * - Exchange rate streaming
 * - Connection management and reconnection
 */

import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url: string;
  auth?: {
    userId?: string;
    adminId?: string;
    token?: string;
  };
  options?: {
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
  };
}

export interface ChannelMessage {
  channel: string;
  data: any;
  timestamp: Date;
  source: 'system' | 'user' | 'admin';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SystemHealth {
  timestamp: Date;
  connections: {
    total: number;
    users: number;
    admins: number;
    system: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    messageRate: number;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>;
}

export interface TransactionEvent {
  id: string;
  userId: string;
  type: 'created' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  status: string;
  metadata: any;
  timestamp: Date;
}

export class WebSocketClient {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers = new Map<string, Set<Function>>();
  private connectionStatusListeners: Array<(status: 'connecting' | 'connected' | 'disconnected' | 'error') => void> = [];
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionStatus('connecting');

        this.socket = io(`${this.config.url}/realtime`, {
          auth: this.config.auth,
          transports: ['websocket', 'polling'],
          timeout: this.config.options?.timeout || 20000,
          reconnection: this.config.options?.reconnection !== false,
          reconnectionAttempts: this.config.options?.reconnectionAttempts || 5,
          reconnectionDelay: this.config.options?.reconnectionDelay || 1000,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.updateConnectionStatus('connected');
          this.startPingInterval();
          
          console.log('🚀 ARKHAM WebSocket connected successfully');
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          this.updateConnectionStatus('disconnected');
          this.stopPingInterval();
          
          console.log('📡 ARKHAM WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
          this.isConnected = false;
          this.updateConnectionStatus('error');
          this.reconnectAttempts++;
          
          console.error('❌ ARKHAM WebSocket connection error:', error);
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        // Setup core event handlers
        this.setupCoreEventHandlers();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.stopPingInterval();
    this.updateConnectionStatus('disconnected');
    
    console.log('📡 ARKHAM WebSocket disconnected manually');
  }

  /**
   * Check if connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      this.socket.emit('channel:subscribe', { channel }, (response: any) => {
        if (response?.error) {
          console.error(`Failed to subscribe to ${channel}:`, response.error);
          resolve(false);
        } else {
          console.log(`📡 Subscribed to channel: ${channel}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      this.socket.emit('channel:unsubscribe', { channel }, (response: any) => {
        if (response?.error) {
          console.error(`Failed to unsubscribe from ${channel}:`, response.error);
          resolve(false);
        } else {
          console.log(`📡 Unsubscribed from channel: ${channel}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Send message to channel
   */
  sendToChannel(channel: string, message: any, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      this.socket.emit('channel:message', { channel, message, priority }, (response: any) => {
        if (response?.error) {
          console.error(`Failed to send message to ${channel}:`, response.error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth | null> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(null);
        return;
      }

      this.socket.emit('system:health:get', (health: SystemHealth) => {
        resolve(health);
      });
    });
  }

  /**
   * Subscribe to admin events (for admin users)
   */
  async subscribeToAdmin(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      this.socket.emit('admin:subscribe', {}, (response: any) => {
        if (response?.error) {
          console.error('Failed to subscribe to admin events:', response.error);
          resolve(false);
        } else {
          console.log('🔑 Admin subscriptions activated');
          resolve(true);
        }
      });
    });
  }

  /**
   * Update authentication
   */
  updateAuth(auth: { userId?: string; adminId?: string; role?: 'user' | 'admin' | 'system' }): void {
    if (this.socket) {
      this.socket.emit('auth:update', auth);
    }
  }

  /**
   * Add event listener
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Add connection status listener
   */
  onConnectionStatusChange(listener: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void): void {
    this.connectionStatusListeners.push(listener);
  }

  /**
   * Remove connection status listener
   */
  offConnectionStatusChange(listener: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void): void {
    this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
  }

  // ========================================
  // SPECIFIC EVENT HELPERS
  // ========================================

  /**
   * Listen for transaction events
   */
  onTransactionEvent(handler: (event: TransactionEvent) => void): void {
    this.on('transaction:event', handler);
  }

  /**
   * Listen for admin dashboard updates
   */
  onAdminDashboardUpdate(handler: (data: any) => void): void {
    this.on('admin:dashboard', handler);
  }

  /**
   * Listen for system health updates
   */
  onSystemHealthUpdate(handler: (health: SystemHealth) => void): void {
    this.on('system:health', handler);
  }

  /**
   * Listen for system alerts
   */
  onSystemAlert(handler: (alert: { type: string; message: string; timestamp: Date }) => void): void {
    this.on('system:alert', handler);
  }

  /**
   * Listen for exchange rate updates
   */
  onExchangeRateUpdate(handler: (data: any) => void): void {
    this.on('channel:message', (message: ChannelMessage) => {
      if (message.channel === 'exchange-rates' && message.data.type === 'rate_update') {
        handler(message.data.data);
      }
    });
  }

  /**
   * Listen for ACT token price updates
   */
  onActPriceUpdate(handler: (data: any) => void): void {
    this.on('channel:message', (message: ChannelMessage) => {
      if (message.channel === 'act-token' && message.data.type === 'price_update') {
        handler(message.data.data);
      }
    });
  }

  /**
   * Listen for user notifications
   */
  onUserNotification(handler: (notification: any) => void): void {
    this.on('user:notifications', handler);
  }

  /**
   * Listen for admin alerts
   */
  onAdminAlert(handler: (alert: any) => void): void {
    this.on('admin:alerts', handler);
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  private setupCoreEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connection:established', (data) => {
      console.log('✅ WebSocket connection established:', data.connectionId);
    });

    this.socket.on('connection:welcome', (data) => {
      console.log('🎉 Welcome to ARKHAM Real-Time Platform:', data.message);
    });

    // Channel events
    this.socket.on('channel:subscribed', (data) => {
      console.log(`✅ Subscribed to channel: ${data.channel}`);
    });

    this.socket.on('channel:message', (message: ChannelMessage) => {
      this.emitEvent('channel:message', message);
    });

    this.socket.on('channel:error', (error) => {
      console.error('Channel error:', error);
    });

    // System events
    this.socket.on('system:health', (health: SystemHealth) => {
      this.emitEvent('system:health', health);
    });

    this.socket.on('system:alert', (alert) => {
      this.emitEvent('system:alert', alert);
    });

    this.socket.on('system:error', (error) => {
      console.error('System error:', error);
    });

    // Transaction events
    this.socket.on('transaction:event', (event: TransactionEvent) => {
      this.emitEvent('transaction:event', event);
    });

    this.socket.on('transaction:created', (data) => {
      this.emitEvent('transaction:created', data);
    });

    this.socket.on('transaction:completed', (data) => {
      this.emitEvent('transaction:completed', data);
    });

    this.socket.on('transaction:failed', (data) => {
      this.emitEvent('transaction:failed', data);
    });

    // Admin events
    this.socket.on('admin:dashboard', (data) => {
      this.emitEvent('admin:dashboard', data);
    });

    this.socket.on('admin:subscribed', (data) => {
      console.log('🔑 Admin subscriptions confirmed:', data.channels);
    });

    // Admin specific alerts
    this.socket.on('compliance:large_transaction', (data) => {
      this.emitEvent('compliance:large_transaction', data);
    });

    // User events
    this.socket.on('user:notifications', (notification) => {
      this.emitEvent('user:notifications', notification);
    });

    this.socket.on('welcome', (data) => {
      this.emitEvent('welcome', data);
    });

    this.socket.on('kyc_status', (data) => {
      this.emitEvent('kyc_status', data);
    });

    // Market data
    this.socket.on('market:significant_change', (data) => {
      this.emitEvent('market:significant_change', data);
    });

    // Health monitoring
    this.socket.on('pong', (data) => {
      // Handle pong response
      console.debug('🏓 Pong received:', data.serverTime);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emitEvent('error', error);
    });
  }

  private emitEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private updateConnectionStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.connectionStatusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// ========================================
// SINGLETON INSTANCE FOR APP-WIDE USE
// ========================================

let globalWebSocketClient: WebSocketClient | null = null;

/**
 * Get or create global WebSocket client instance
 */
export function getWebSocketClient(config?: WebSocketConfig): WebSocketClient {
  if (!globalWebSocketClient && config) {
    globalWebSocketClient = new WebSocketClient(config);
  }
  
  if (!globalWebSocketClient) {
    throw new Error('WebSocket client not initialized. Call getWebSocketClient() with config first.');
  }
  
  return globalWebSocketClient;
}

/**
 * Initialize WebSocket client with configuration
 */
export function initializeWebSocket(config: WebSocketConfig): WebSocketClient {
  globalWebSocketClient = new WebSocketClient(config);
  return globalWebSocketClient;
}

/**
 * Disconnect and cleanup global client
 */
export function disconnectWebSocket(): void {
  if (globalWebSocketClient) {
    globalWebSocketClient.disconnect();
    globalWebSocketClient = null;
  }
}