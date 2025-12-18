import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebSocketService } from '../../services/websocket.service';
import { RealTimeEventsService } from '../../services/real-time-events.service';
import { WebSocketGateway } from '../../gateways/websocket.gateway';

/**
 * ARKHAM Phase 1: Real-Time Madness
 * WebSocket Module - Integrates all real-time functionality
 * 
 * Features:
 * - Enterprise-grade WebSocket service
 * - Socket.IO gateway for connections
 * - Connection pool management
 * - Admin broadcast channels
 * - User notification streams
 * - System health monitoring
 * - Transaction event streaming
 */

@Module({
  imports: [
    ConfigModule, // For accessing configuration in the service
  ],
  providers: [
    WebSocketService,
    RealTimeEventsService,
    WebSocketGateway,
  ],
  exports: [
    WebSocketService, // Export service for use in other modules
    RealTimeEventsService, // Export real-time events service
  ],
})
export class WebSocketModule {}

/**
 * Integration Examples:
 * 
 * 1. Inject WebSocketService into other services:
 * 
 * constructor(private websocketService: WebSocketService) {}
 * 
 * 2. Send real-time updates:
 * 
 * // Send to all admins
 * this.websocketService.sendToAdmins('user:registered', {
 *   userId: '123',
 *   email: 'user@example.com',
 *   timestamp: new Date()
 * });
 * 
 * // Send to specific user
 * this.websocketService.sendToUsersWithUserId('user123', 'transaction:completed', {
 *   transactionId: 'txn_456',
 *   amount: 100,
 *   currency: 'USD'
 * });
 * 
 * // Broadcast to channel
 * this.websocketService.broadcastToChannel('exchange-rates', {
 *   rates: { USD: 1.0, EUR: 0.85 },
 *   timestamp: new Date()
 * });
 * 
 * // Stream transaction events
 * this.websocketService.streamTransactionEvent({
 *   id: 'txn_123',
 *   userId: 'user_456',
 *   type: 'completed',
 *   amount: 100,
 *   currency: 'USD',
 *   status: 'success',
 *   metadata: {},
 *   timestamp: new Date()
 * });
 * 
 * 3. System health monitoring:
 * 
 * // Get current health metrics
 * const health = this.websocketService.getSystemHealth();
 * 
 * // Send system alerts
 * this.websocketService.sendSystemAlert('warning', 'High CPU usage detected', {
 *   cpuUsage: 85.5,
 *   threshold: 80
 * });
 */