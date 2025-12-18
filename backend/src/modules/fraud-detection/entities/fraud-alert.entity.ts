import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';
import { RiskFactor } from '../../../../types/index';

@Entity('fraud_alerts')
export class FraudAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  transactionId: string | null;

  @Column('varchar')
  alertType: 'high_risk' | 'suspicious_pattern' | 'velocity_check' | 'geographic_anomaly';

  @Column('varchar')
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column('numeric', { precision: 5, scale: 2 })
  confidenceScore: number;

  @Column('numeric', { precision: 5, scale: 2 })
  riskScore: number;

  @Column('text')
  description: string;

  @Column('jsonb')
  riskFactors: RiskFactor[];

  @Column('jsonb')
  suggestedActions: string[];

  @Column('varchar')
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';

  @Column('uuid', { nullable: true })
  assignedTo: string | null;

  @Column('timestamptz', { nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => TransactionEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: TransactionEntity | null;

  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignedUser: UserEntity | null;
}