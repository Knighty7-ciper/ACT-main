import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

/**
 * ARKHAM Phase 1: Real-Time Madness
 * Enterprise-Grade WebSocket Service
 * 
 * Features:
 * - Connection Pool Management for thousands of concurrent users
 * - Admin Broadcast Channels for instant dashboard updates
 * - User Notification Streams for personalized updates
 * - System Health Monitoring with live metrics
 * - Transaction Event Streaming for real-time financial updates
 * - Error Handling & Connection Recovery
 * - Scalability Architecture
 */

export interface WebSocketConnection {
  id: string;
  userId?: string;
  adminId?: string;
  socket: any; // Socket.IO Socket instance
  connectedAt: Date;
  lastActivity: Date;
  channels: Set<string>;
  isAlive: boolean;
  metadata: {
    ip: string;
    userAgent: string;
    role: 'user' | 'admin' | 'system';
  };
}

export interface ChannelMessage {
  channel: string;
  data: any;
  timestamp: Date;
  source: 'system' | 'user' | 'admin';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SystemHealthMetrics {
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
    messageRate: number; // messages per second
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

@Injectable()
export class WebSocketService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebSocketService.name);
  
  // Connection Management
  private connections = new Map<string, WebSocketConnection>();
  private connectionPool: WebSocketConnection[] = [];
  
  // Channel Management
  private channels = new Map<string, Set<string>>(); // channel -> connectionIds
  private channelBroadcasters = new Map<string, (message: ChannelMessage) => void>();
  
  // Health Monitoring
  private healthMetrics: SystemHealthMetrics;
  private healthCheckInterval: NodeJS.Timeout;
  private messageRateCounter = 0;
  private lastRateReset = Date.now();
  
  // Performance Tracking
  private performanceStats = {
    totalMessagesProcessed: 0,
    totalConnectionsHandled: 0,
    averageConnectionDuration: 0,
    peakConcurrentConnections: 0,
    errorsLogged: 0
  };

  // Rate Limiting
  private messageLimits = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT_MESSAGES = 100;
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute

  constructor(private configService: ConfigService) {
    super();
    this.initializeHealthMetrics();
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('🚀 ARKHAM WebSocket Service Initializing...');
    
    // Initialize system health metrics
    this.initializeHealthMetrics();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Set up cleanup intervals
    this.setupCleanupIntervals();
    
    // Initialize channel broadcasters
    this.setupChannelBroadcasters();
    
    this.logger.log('✅ ARKHAM WebSocket Service Ready for Real-Time Madness');
    this.logger.log(`📊 Target: Support ${this.configService.get('MAX_CONCURRENT_CONNECTIONS', 10000)} concurrent connections`);
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('🛑 ARKHAM WebSocket Service Shutting Down...');
    
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Clean up all connections gracefully
    await this.gracefulShutdown();
    
    this.logger.log('✅ ARKHAM WebSocket Service Shut Down Complete');
  }

  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================

  /**
   * Register a new WebSocket connection with enterprise features
   */
  registerConnection(
    socket: any,
    userId?: string,
    adminId?: string,
    metadata?: { ip: string; userAgent: string; role: 'user' | 'admin' | 'system' }
  ): string {
    const connectionId = this.generateConnectionId();
    
    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      adminId,
      socket,
      connectedAt: new Date(),
      lastActivity: new Date(),
      channels: new Set(),
      isAlive: true,
      metadata: {
        ip: metadata?.ip || 'unknown',
        userAgent: metadata?.userAgent || 'unknown',
        role: metadata?.role || 'user'
      }
    };

    // Add to connection pool
    this.connections.set(connectionId, connection);
    this.connectionPool.push(connection);
    
    // Update performance stats
    this.performanceStats.totalConnectionsHandled++;
    this.performanceStats.peakConcurrentConnections = Math.max(
      this.performanceStats.peakConcurrentConnections,
      this.connections.size
    );

    this.logger.log(`📡 New connection registered: ${connectionId} (${this.connections.size} total)`);
    
    // Emit connection event for admin monitoring
    this.emit('connection:registered', {
      connectionId,
      userId,
      adminId,
      role: connection.metadata.role,
      timestamp: new Date()
    });

    // Send welcome message
    this.sendToConnection(connectionId, 'connection:welcome', {
      connectionId,
      message: 'Welcome to ARKHAM Real-Time Platform',
      timestamp: new Date(),
      capabilities: this.getConnectionCapabilities(connection.metadata.role)
    });

    return connectionId;
  }

  /**
   * Remove connection with cleanup
   */
  async removeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from all channels
    for (const channel of connection.channels) {
      this.removeFromChannel(connectionId, channel);
    }

    // Remove from connection pool
    this.connections.delete(connectionId);
    this.connectionPool = this.connectionPool.filter(conn => conn.id !== connectionId);

    this.logger.log(`📡 Connection removed: ${connectionId} (${this.connections.size} remaining)`);

    // Emit disconnection event
    this.emit('connection:removed', {
      connectionId,
      duration: Date.now() - connection.connectedAt.getTime(),
      reason: 'client_disconnected'
    });
  }

  /**
   * Update connection activity
   */
  updateActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  // ========================================
  // CHANNEL MANAGEMENT
  // ========================================

  /**
   * Subscribe connection to channel
   */
  subscribeToChannel(connectionId: string, channel: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    // Add to channel
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(connectionId);

    // Add to connection channels
    connection.channels.add(channel);

    this.logger.log(`📡 ${connectionId} subscribed to channel: ${channel}`);

    // Send confirmation
    this.sendToConnection(connectionId, 'channel:subscribed', {
      channel,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Unsubscribe connection from channel
   */
  unsubscribeFromChannel(connectionId: string, channel: string): boolean {
    return this.removeFromChannel(connectionId, channel);
  }

  /**
   * Broadcast message to channel
   */
  broadcastToChannel(channel: string, data: any, source: 'system' | 'user' | 'admin' = 'system', priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): void {
    const message: ChannelMessage = {
      channel,
      data,
      timestamp: new Date(),
      source,
      priority
    };

    const channelConnections = this.channels.get(channel);
    if (!channelConnections || channelConnections.size === 0) return;

    // Increment message counter
    this.messageRateCounter++;
    this.performanceStats.totalMessagesProcessed++;

    // Send to all connections in channel
    for (const connectionId of channelConnections) {
      this.sendToConnection(connectionId, 'channel:message', message);
    }

    this.logger.debug(`📡 Broadcast to channel ${channel}: ${channelConnections.size} connections`);
  }

  // ========================================
  // MESSAGE HANDLING
  // ========================================

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionId: string, event: string, data: any): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isAlive) return false;

    try {
      // Check rate limiting
      if (!this.checkRateLimit(connectionId)) {
        this.logger.warn(`Rate limit exceeded for connection: ${connectionId}`);
        return false;
      }

      // Send message
      connection.socket.emit(event, data);
      this.updateActivity(connectionId);

      return true;
    } catch (error) {
      this.logger.error(`Error sending message to ${connectionId}:`, error);
      this.performanceStats.errorsLogged++;
      
      // Mark connection as potentially dead
      connection.isAlive = false;
      return false;
    }
  }

  /**
   * Send to admin connections only
   */
  sendToAdmins(event: string, data: any, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): void {
    for (const [connectionId, connection] of this.connections) {
      if (connection.adminId && connection.isAlive) {
        this.sendToConnection(connectionId, event, { ...data, priority });
      }
    }
  }

  /**
   * Send to user connections only
   */
  sendToUsers(event: string, data: any, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): void {
    for (const [connectionId, connection] of this.connections) {
      if (connection.userId && !connection.adminId && connection.isAlive) {
        this.sendToConnection(connectionId, event, data);
      }
    }
  }

  // ========================================
  // SYSTEM HEALTH MONITORING
  // ========================================

  /**
   * Get current system health metrics
   */
  getSystemHealth(): SystemHealthMetrics {
    return { ...this.healthMetrics };
  }

  /**
   * Send health update to admin dashboards
   */
  broadcastHealthUpdate(): void {
    this.updateHealthMetrics();
    this.sendToAdmins('system:health', this.healthMetrics, 'high');
  }

  // ========================================
  // TRANSACTION EVENT STREAMING
  // ========================================

  /**
   * Stream transaction events to relevant parties
   */
  streamTransactionEvent(event: TransactionEvent): void {
    // Broadcast to admins for monitoring
    this.sendToAdmins('transaction:event', event, event.type === 'failed' ? 'urgent' : 'normal');
    
    // Send to specific user
    if (event.userId) {
      this.sendToUsersWithUserId(event.userId, 'transaction:update', event, 'high');
    }

    // Broadcast to public transaction channel
    this.broadcastToChannel('transactions:public', {
      type: 'transaction_event',
      data: event
    }, 'system', 'normal');

    this.logger.log(`💰 Transaction event streamed: ${event.type} - $${event.amount} ${event.currency}`);
  }

  /**
   * Send to users with specific userId
   */
  public sendToUsersWithUserId(userId: string, event: string, data: any, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): void {
    for (const [connectionId, connection] of this.connections) {
      if (connection.userId === userId && connection.isAlive) {
        this.sendToConnection(connectionId, event, data);
      }
    }
  }

  // ========================================
  // ADMIN BROADCAST CHANNELS
  // ========================================

  /**
   * Admin dashboard updates
   */
  updateAdminDashboard(data: any): void {
    this.sendToAdmins('admin:dashboard', data, 'high');
  }

  /**
   * System alerts for admins
   */
  sendSystemAlert(type: 'warning' | 'error' | 'info', message: string, metadata?: any): void {
    const alert = {
      type,
      message,
      metadata,
      timestamp: new Date(),
      id: this.generateAlertId()
    };

    // Add to health metrics
    this.healthMetrics.alerts.unshift(alert);
    if (this.healthMetrics.alerts.length > 100) {
      this.healthMetrics.alerts = this.healthMetrics.alerts.slice(0, 100);
    }

    // Broadcast to admins
    this.sendToAdmins('system:alert', alert, type === 'error' ? 'urgent' : 'high');

    this.logger.warn(`🚨 System Alert: ${type.toUpperCase()} - ${message}`);
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private removeFromChannel(connectionId: string, channel: string): boolean {
    const channelConnections = this.channels.get(channel);
    if (!channelConnections) return false;

    // Remove from channel
    channelConnections.delete(connectionId);
    if (channelConnections.size === 0) {
      this.channels.delete(channel);
    }

    // Remove from connection
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.channels.delete(channel);
    }

    this.logger.debug(`📡 ${connectionId} unsubscribed from channel: ${channel}`);
    
    // Send confirmation
    this.sendToConnection(connectionId, 'channel:unsubscribed', {
      channel,
      timestamp: new Date()
    });

    return true;
  }

  private initializeHealthMetrics(): void {
    this.healthMetrics = {
      timestamp: new Date(),
      connections: {
        total: 0,
        users: 0,
        admins: 0,
        system: 0
      },
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        activeConnections: 0,
        messageRate: 0
      },
      alerts: []
    };
  }

  private updateHealthMetrics(): void {
    // Count connections by type
    let users = 0, admins = 0, system = 0;
    for (const connection of this.connections.values()) {
      if (connection.adminId) admins++;
      else if (connection.metadata.role === 'system') system++;
      else users++;
    }

    // Calculate message rate
    const now = Date.now();
    const timeDiff = now - this.lastRateReset;
    if (timeDiff >= 1000) { // Reset every second
      this.healthMetrics.performance.messageRate = this.messageRateCounter;
      this.messageRateCounter = 0;
      this.lastRateReset = now;
    }

    this.healthMetrics = {
      timestamp: new Date(),
      connections: {
        total: this.connections.size,
        users,
        admins,
        system
      },
      performance: {
        cpuUsage: process.cpuUsage().user / 1000, // Simplified CPU usage
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        activeConnections: this.connections.size,
        messageRate: this.healthMetrics.performance.messageRate
      },
      alerts: [...this.healthMetrics.alerts]
    };
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.broadcastHealthUpdate();
      this.performHealthChecks();
    }, 30000); // Every 30 seconds

    this.logger.log('📊 Health monitoring started (30s interval)');
  }

  private performHealthChecks(): void {
    // Check for dead connections
    const deadConnections: string[] = [];
    const now = Date.now();
    const DEAD_CONNECTION_THRESHOLD = 60000; // 1 minute

    for (const [connectionId, connection] of this.connections) {
      if (!connection.isAlive || (now - connection.lastActivity.getTime()) > DEAD_CONNECTION_THRESHOLD) {
        deadConnections.push(connectionId);
      }
    }

    // Clean up dead connections
    for (const connectionId of deadConnections) {
      this.logger.warn(`🗑️ Cleaning up dead connection: ${connectionId}`);
      this.connections.delete(connectionId);
    }

    // Check system resource usage
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    if (memUsage > 500) { // 500MB threshold
      this.sendSystemAlert('warning', `High memory usage: ${memUsage.toFixed(2)}MB`, { memoryUsage: memUsage });
    }

    // Check connection limits
    const maxConnections = this.configService.get('MAX_CONCURRENT_CONNECTIONS', 10000);
    if (this.connections.size > maxConnections * 0.9) {
      this.sendSystemAlert('warning', `Approaching connection limit: ${this.connections.size}/${maxConnections}`, {
        currentConnections: this.connections.size,
        maxConnections
      });
    }
  }

  private setupCleanupIntervals(): void {
    // Clean up old rate limit entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.messageLimits) {
        if (now > value.resetTime) {
          this.messageLimits.delete(key);
        }
      }
    }, 60000); // Every minute

    // Clean up inactive connections
    setInterval(() => {
      const inactiveConnections: string[] = [];
      const now = Date.now();
      const INACTIVE_THRESHOLD = 300000; // 5 minutes

      for (const [connectionId, connection] of this.connections) {
        if ((now - connection.lastActivity.getTime()) > INACTIVE_THRESHOLD) {
          inactiveConnections.push(connectionId);
        }
      }

      for (const connectionId of inactiveConnections) {
        this.removeConnection(connectionId);
      }

      if (inactiveConnections.length > 0) {
        this.logger.log(`🧹 Cleaned up ${inactiveConnections.length} inactive connections`);
      }
    }, 60000); // Every minute
  }

  private setupChannelBroadcasters(): void {
    // Set up automatic broadcasters for common channels
    const broadcasters = [
      'admin:dashboard',
      'system:health',
      'transactions:public',
      'user:notifications',
      'system:alerts'
    ];

    for (const channel of broadcasters) {
      this.channelBroadcasters.set(channel, (message: ChannelMessage) => {
        this.broadcastToChannel(channel, message.data, message.source, message.priority);
      });
    }
  }

  private checkRateLimit(connectionId: string): boolean {
    const now = Date.now();
    const limit = this.messageLimits.get(connectionId);

    if (!limit || now > limit.resetTime) {
      this.messageLimits.set(connectionId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (limit.count >= this.RATE_LIMIT_MESSAGES) {
      return false;
    }

    limit.count++;
    return true;
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getConnectionCapabilities(role: 'user' | 'admin' | 'system'): string[] {
    const baseCapabilities = ['basic_messaging', 'channel_subscription'];
    
    switch (role) {
      case 'admin':
        return [...baseCapabilities, 'dashboard_updates', 'system_monitoring', 'user_management'];
      case 'user':
        return [...baseCapabilities, 'transaction_updates', 'notifications'];
      case 'system':
        return ['system_monitoring', 'health_checks'];
      default:
        return baseCapabilities;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.log('Starting graceful shutdown...');

    // Notify all connections
    for (const [connectionId, connection] of this.connections) {
      this.sendToConnection(connectionId, 'system:shutdown', {
        message: 'Server is shutting down',
        timestamp: new Date()
      });
    }

    // Wait a bit for messages to send
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force close all connections
    for (const [connectionId, connection] of this.connections) {
      try {
        connection.socket.disconnect();
      } catch (error) {
        this.logger.error(`Error closing connection ${connectionId}:`, error);
      }
    }

    this.logger.log('Graceful shutdown complete');
  }
}