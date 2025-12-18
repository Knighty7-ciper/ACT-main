import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketService, ChannelMessage } from '../services/websocket.service';

/**
 * ARKHAM Phase 1: Real-Time Madness
 * WebSocket Gateway - Socket.IO Implementation
 * 
 * Handles:
 * - Socket.IO connection management
 * - Authentication and authorization
 * - Message routing and broadcasting
 * - Real-time event handling
 * - Admin dashboard updates
 * - User notifications
 */

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class WebSocketGatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGatewayService.name);

  constructor(private websocketService: WebSocketService) {}

  /**
   * Gateway initialization
   */
  afterInit(server: Server): void {
    this.logger.log('ARKHAM WebSocket Gateway Initialized');
    this.logger.log(`Socket.IO Server ready on namespace: /realtime`);
    this.logger.log(`CORS enabled for frontend domains`);
    this.logger.log(`Ping timeout: 60s, Ping interval: 25s`);
  }

  /**
   * Handle new client connection
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const ip = client.handshake.address || 'unknown';
      const userAgent = client.handshake.headers['user-agent'] || 'unknown';
      
      this.logger.log(`Client connected: ${client.id} from ${ip}`);
      
      // Extract authentication from handshake
      const authData = this.extractAuthData(client);
      const { userId, adminId, role } = authData;

      // Register connection in service
      const connectionId = this.websocketService.registerConnection(
        client,
        userId,
        adminId,
        { ip, userAgent, role: role || 'user' }
      );

      // Store connection ID in socket for reference
      (client as any).connectionId = connectionId;

      // Send initial connection acknowledgment
      client.emit('connection:established', {
        connectionId,
        timestamp: new Date(),
        message: 'Successfully connected to ARKHAM Real-Time Platform',
        serverTime: new Date().toISOString(),
      });

      // Subscribe to default channels based on role
      this.subscribeToDefaultChannels(client, role);

      // Setup connection event handlers
      this.setupConnectionHandlers(client);

      this.logger.log(`Connection established: ${client.id} (${role || 'user'})`);
      
    } catch (error) {
      this.logger.error(`Connection error for ${client.id}:`, error);
      client.emit('connection:error', {
        error: 'Connection failed',
        message: 'Unable to establish connection',
        timestamp: new Date(),
      });
      client.disconnect(true);
    }
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket): Promise<void> {
    const connectionId = (client as any).connectionId;
    
    if (connectionId) {
      await this.websocketService.removeConnection(connectionId);
      this.logger.log(`Client disconnected: ${client.id} (${connectionId})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id} (no connection ID)`);
    }
  }

  /**
   * Subscribe to a channel
   */
  @SubscribeMessage('channel:subscribe')
  handleSubscribeToChannel(
    @MessageBody() data: { channel: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const connectionId = (client as any).connectionId;
      if (!connectionId) {
        client.emit('channel:error', {
          error: 'No connection ID',
          message: 'Connection not properly established',
          timestamp: new Date(),
        });
        return;
      }

      const success = this.websocketService.subscribeToChannel(connectionId, data.channel);
      
      if (success) {
        client.emit('channel:subscribed', {
          channel: data.channel,
          timestamp: new Date(),
        });
        this.logger.debug(`${client.id} subscribed to ${data.channel}`);
      } else {
        client.emit('channel:error', {
          error: 'Subscription failed',
          message: `Failed to subscribe to channel: ${data.channel}`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`Error subscribing ${client.id} to channel:`, error);
      client.emit('channel:error', {
        error: 'Subscription error',
        message: 'Internal server error',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Unsubscribe from a channel
   */
  @SubscribeMessage('channel:unsubscribe')
  handleUnsubscribeFromChannel(
    @MessageBody() data: { channel: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const connectionId = (client as any).connectionId;
      if (!connectionId) return;

      const success = this.websocketService.unsubscribeFromChannel(connectionId, data.channel);
      
      if (success) {
        client.emit('channel:unsubscribed', {
          channel: data.channel,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`Error unsubscribing ${client.id} from channel:`, error);
    }
  }

  /**
   * Send a message to a specific channel
   */
  @SubscribeMessage('channel:message')
  handleChannelMessage(
    @MessageBody() data: { channel: string; message: any; priority?: 'low' | 'normal' | 'high' | 'urgent' },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const connectionId = (client as any).connectionId;
      if (!connectionId) return;

      // Verify client is subscribed to the channel
      const connection = this.websocketService['connections'].get(connectionId);
      if (!connection || !connection.channels.has(data.channel)) {
        client.emit('channel:error', {
          error: 'Not subscribed',
          message: 'You are not subscribed to this channel',
          channel: data.channel,
          timestamp: new Date(),
        });
        return;
      }

      // Create channel message
      const channelMessage: ChannelMessage = {
        channel: data.channel,
        data: data.message,
        timestamp: new Date(),
        source: connection.adminId ? 'admin' : 'user',
        priority: data.priority || 'normal',
      };

      // Broadcast to channel
      this.websocketService.broadcastToChannel(
        data.channel,
        data.message,
        connection.adminId ? 'admin' : 'user',
        data.priority || 'normal'
      );

      client.emit('channel:message:sent', {
        channel: data.channel,
        timestamp: new Date(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

    } catch (error) {
      this.logger.error(`Error handling channel message from ${client.id}:`, error);
      client.emit('channel:error', {
        error: 'Message error',
        message: 'Failed to send message',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Request system health status
   */
  @SubscribeMessage('system:health:get')
  handleGetSystemHealth(@ConnectedSocket() client: Socket): void {
    try {
      const health = this.websocketService.getSystemHealth();
      client.emit('system:health', health);
    } catch (error) {
      this.logger.error(`Error getting system health for ${client.id}:`, error);
      client.emit('system:error', {
        error: 'Health check failed',
        message: 'Unable to retrieve system health',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Subscribe to admin events (admin only)
   */
  @SubscribeMessage('admin:subscribe')
  handleAdminSubscribe(@ConnectedSocket() client: Socket): void {
    try {
      const connectionId = (client as any).connectionId;
      if (!connectionId) return;

      const connection = this.websocketService['connections'].get(connectionId);
      if (!connection || !connection.adminId) {
        client.emit('admin:error', {
          error: 'Unauthorized',
          message: 'Admin access required',
          timestamp: new Date(),
        });
        return;
      }

      // Subscribe to admin-specific channels
      const adminChannels = [
        'admin:dashboard',
        'admin:users',
        'admin:transactions',
        'admin:system',
        'admin:alerts',
      ];

      for (const channel of adminChannels) {
        this.websocketService.subscribeToChannel(connectionId, channel);
      }

      client.emit('admin:subscribed', {
        channels: adminChannels,
        timestamp: new Date(),
        message: 'Admin subscriptions activated',
      });

      this.logger.log(`Admin subscriptions activated for ${client.id}`);
    } catch (error) {
      this.logger.error(`Error setting up admin subscriptions for ${client.id}:`, error);
    }
  }

  /**
   * Handle ping/pong for connection health
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      timestamp: new Date(),
      serverTime: new Date().toISOString(),
    });
  }

  /**
   * Handle client authentication update
   */
  @SubscribeMessage('auth:update')
  handleAuthUpdate(
    @MessageBody() data: { userId?: string; adminId?: string; role?: 'user' | 'admin' | 'system' },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const connectionId = (client as any).connectionId;
      if (!connectionId) return;

      // Update connection in service
      const connection = this.websocketService['connections'].get(connectionId);
      if (connection) {
        if (data.userId !== undefined) connection.userId = data.userId;
        if (data.adminId !== undefined) connection.adminId = data.adminId;
        if (data.role !== undefined) connection.metadata.role = data.role;

        // Resubscribe to appropriate channels
        this.subscribeToDefaultChannels(client, data.role);
      }

      client.emit('auth:updated', {
        userId: data.userId,
        adminId: data.adminId,
        role: data.role,
        timestamp: new Date(),
      });

      this.logger.log(`Auth updated for ${client.id}: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error(`Error updating auth for ${client.id}:`, error);
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Extract authentication data from socket handshake
   */
  private extractAuthData(client: Socket): { userId?: string; adminId?: string; role?: 'user' | 'admin' | 'system' } {
    // Try to get auth from handshake auth
    const auth = client.handshake.auth;
    if (auth) {
      return {
        userId: auth.userId,
        adminId: auth.adminId,
        role: auth.role,
      };
    }

    // Try to get from headers
    const headers = client.handshake.headers;
    return {
      userId: headers['x-user-id'] as string,
      adminId: headers['x-admin-id'] as string,
      role: (headers['x-user-role'] as any) || 'user',
    };
  }

  /**
   * Subscribe to default channels based on role
   */
  private subscribeToDefaultChannels(client: Socket, role?: string): void {
    const connectionId = (client as any).connectionId;
    if (!connectionId) return;

    const defaultChannels = ['user:notifications', 'system:updates'];

    // Role-specific channels
    switch (role) {
      case 'admin':
        defaultChannels.push('admin:dashboard', 'admin:alerts', 'admin:system');
        break;
      case 'user':
        defaultChannels.push('user:transactions', 'user:profile');
        break;
      case 'system':
        defaultChannels.push('system:monitoring');
        break;
    }

    // Subscribe to all default channels
    for (const channel of defaultChannels) {
      this.websocketService.subscribeToChannel(connectionId, channel);
    }

    this.logger.debug(`Subscribed ${client.id} to ${defaultChannels.length} default channels`);
  }

  /**
   * Setup connection-specific event handlers
   */
  private setupConnectionHandlers(client: Socket): void {
    // Handle client errors
    client.on('error', (error) => {
      this.logger.error(`Socket error for ${client.id}:`, error);
    });

    // Handle client disconnect
    client.on('disconnect', (reason) => {
      this.logger.log(`Client ${client.id} disconnected: ${reason}`);
    });

    // Handle client typing indicators (for chat-like features)
    client.on('typing:start', (data) => {
      const connectionId = (client as any).connectionId;
      if (connectionId && data.channel) {
        this.websocketService.broadcastToChannel(data.channel, {
          type: 'typing_start',
          userId: data.userId,
          connectionId,
        }, 'user', 'low');
      }
    });

    client.on('typing:stop', (data) => {
      const connectionId = (client as any).connectionId;
      if (connectionId && data.channel) {
        this.websocketService.broadcastToChannel(data.channel, {
          type: 'typing_stop',
          userId: data.userId,
          connectionId,
        }, 'user', 'low');
      }
    });

    // Handle read receipts for messages
    client.on('message:read', (data) => {
      const connectionId = (client as any).connectionId;
      if (connectionId) {
        // Emit read receipt to sender
        if (data.senderId) {
          this.websocketService.sendToUsersWithUserId(data.senderId, 'message:read', {
            messageId: data.messageId,
            readerId: data.userId,
            timestamp: new Date(),
          });
        }
      }
    });
  }
}

export { WebSocketGateway };