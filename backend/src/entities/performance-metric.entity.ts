import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JsonData } from '../types/index';

@Entity('performance_metrics')
export class PerformanceMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  responseTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  memoryUsage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  cpuUsage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  databasePerformance: number;

  @Column({ type: 'jsonb', nullable: true })
  additionalMetrics: JsonData;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}