import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JsonData } from '../../../../types/index';

@Entity('fraud_patterns')
export class FraudPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('text')
  description: string;

  @Column('varchar')
  patternType: 'velocity' | 'geographic' | 'amount' | 'behavioral' | 'device';

  @Column('jsonb')
  patternConditions: JsonData;

  @Column('numeric', { precision: 5, scale: 2 })
  confidenceThreshold: number;

  @Column('boolean')
  isActive: boolean;

  @Column('integer')
  detectionCount: number;

  @Column('integer')
  falsePositiveCount: number;

  @Column('numeric', { precision: 5, scale: 2 })
  successRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}