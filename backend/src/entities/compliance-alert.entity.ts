import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../modules/user/entities/user.entity';
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';
import { JsonData, RiskFactor } from '../types/index';

@Entity('compliance_alerts')
export class ComplianceAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  alertType: string; // 'aml_threshold', 'suspicious_pattern', 'pep_match', 'sanctions_match', 'structuring', 'velocity'

  @Column({ type: 'varchar' })
  severity: string; // 'low', 'medium', 'high', 'critical'

  @Column({ type: 'varchar' })
  status: string; // 'open', 'investigating', 'resolved', 'escalated', 'false_positive'

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  alertRule?: string;

  @Column({ type: 'json' })
  triggerData: JsonData; // Rule configuration that triggered the alert

  @Column({ type: 'json', nullable: true })
  riskFactors?: RiskFactor[]; // Array of risk factors identified

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  transactionAmount?: number;

  @Column({ type: 'varchar', nullable: true })
  transactionCurrency?: string;

  @Column({ type: 'varchar', nullable: true })
  ruleId?: string; // Reference to TransactionMonitoringRule

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  resolvedBy?: string; // Admin user ID

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  escalationDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  escalatedTo?: string; // Regulatory authority or compliance officer

  @Column({ type: 'boolean', default: false })
  sarGenerated: boolean; // Whether a SAR was generated for this alert

  @Column({ type: 'varchar', nullable: true })
  sarReference?: string; // SAR reference number

  @Column({ type: 'timestamp', nullable: true })
  sarSubmissionDate?: Date;

  @Column({ type: 'json', nullable: true })
  automatedActions?: JsonData; // Actions taken automatically by the system

  @Column({ type: 'timestamp', nullable: true })
  lastInvestigationUpdate?: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => TransactionEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction?: TransactionEntity;

  @Column({ type: 'uuid', nullable: true })
  transactionId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}