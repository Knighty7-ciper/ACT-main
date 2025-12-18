import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { JsonData } from '../types/index';

@Entity('compliance_events')
export class ComplianceEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  eventType: string; // 'transaction_monitored', 'kyc_updated', 'alert_created', 'alert_resolved', 'sar_generated', 'compliance_review', 'sanctions_screened'

  @Column({ type: 'varchar' })
  category: string; // 'aml', 'kyc', 'reporting', 'audit', 'sanctions'

  @Column({ type: 'varchar' })
  severity: string; // 'info', 'warning', 'error', 'critical'

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  eventData: JsonData; // Structured data about the event

  @Column({ type: 'varchar', nullable: true })
  userId?: string; // User associated with this event

  @Column({ type: 'varchar', nullable: true })
  transactionId?: string; // Transaction associated with this event

  @Column({ type: 'varchar', nullable: true })
  alertId?: string; // Compliance alert associated with this event

  @Column({ type: 'varchar', nullable: true })
  adminId?: string; // Admin user who performed this action

  @Column({ type: 'varchar', nullable: true })
  adminEmail?: string; // Admin email for reference

  @Column({ type: 'varchar', nullable: true })
  ipAddress?: string; // IP address of the user/admin

  @Column({ type: 'varchar', nullable: true })
  userAgent?: string; // User agent string

  @Column({ type: 'varchar', nullable: true })
  sessionId?: string; // Session identifier

  @Column({ type: 'varchar', nullable: true })
  entityType?: string; // Type of entity affected (user, transaction, wallet, etc.)

  @Column({ type: 'varchar', nullable: true })
  entityId?: string; // ID of the entity affected

  @Column({ type: 'json', nullable: true })
  previousValues?: JsonData; // Previous state of entity before change

  @Column({ type: 'json', nullable: true })
  newValues?: JsonData; // New state of entity after change

  @Column({ type: 'varchar', nullable: true })
  regulatoryFramework?: string; // Regulatory framework applicable (BSA, FATF, etc.)

  @Column({ type: 'varchar', nullable: true })
  complianceRequirement?: string; // Specific compliance requirement being addressed

  @Column({ type: 'boolean', default: false })
  requiresRetention: boolean; // Whether this event must be retained for regulatory purposes

  @Column({ type: 'timestamp', nullable: true })
  retentionUntil?: Date; // When this event can be archived/deleted

  @Column({ type: 'varchar', nullable: true })
  source: string; // 'automated', 'manual', 'integration', 'webhook'

  @Column({ type: 'varchar', nullable: true })
  referenceId?: string; // External reference ID (SAR number, report ID, etc.)

  @Column({ type: 'json', nullable: true })
  metadata?: JsonData; // Additional structured metadata

  @Column({ type: 'boolean', default: false })
  exported: boolean; // Whether this event has been exported for regulatory reporting

  @CreateDateColumn()
  createdAt: Date;
}