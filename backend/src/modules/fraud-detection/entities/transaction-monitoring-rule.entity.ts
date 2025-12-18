import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JsonData } from '../../../../types/index';

@Entity('transaction_monitoring_rules')
export class TransactionMonitoringRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  ruleName: string;

  @Column('varchar')
  ruleType: 'threshold' | 'pattern' | 'frequency';

  @Column('jsonb')
  conditions: JsonData;

  @Column('jsonb')
  actions: string[];

  @Column('varchar')
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';

  @Column('boolean')
  isActive: boolean;

  @Column('integer')
  executionCount: number;

  @Column('timestamptz', { nullable: true })
  lastExecuted: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}