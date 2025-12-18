import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JsonData } from '../types/index';

@Entity('system_health')
export class SystemHealthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({ type: 'varchar', length: 50 })
  databaseHealth: string;

  @Column({ type: 'varchar', length: 50 })
  apiHealth: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  transactionSuccessRate: number;

  @Column({ type: 'integer' })
  activeUsers: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JsonData;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}