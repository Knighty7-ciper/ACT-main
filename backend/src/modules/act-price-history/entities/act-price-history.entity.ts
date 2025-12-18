import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('act_price_history')
export class ACTPriceHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  actValue: number; // Final ACT value in USD equivalent

  @Column({ type: 'date' })
  calculationDate: Date;

  @Column({ type: 'timestamp with time zone' })
  calculationTimestamp: Date;

  // Component breakdown
  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  staplesComponent: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  energyComponent: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  telecomComponent: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  transportComponent: number;

  // Metadata
  @Column({ type: 'int', default: 0 })
  totalProductsProcessed: number;

  @Column({ type: 'int', default: 0 })
  totalCountriesIncluded: number;

  @Column({ type: 'int', default: 0 })
  totalDataPoints: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0 })
  averagePriceVariance: number;

  // Quality metrics
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  dataCompletenessScore: number; // 0.0000 to 1.0000

  @Column({ type: 'varchar', default: 'PPP_WEIGHTED_AVERAGE' })
  calculationMethod: string;

  // External factors
  @Column({ type: 'decimal', precision: 8, scale: 6, default: 1.0 })
  inflationAdjustmentFactor: number;

  @Column({ type: 'decimal', precision: 8, scale: 6, default: 0 })
  volatilityIndex: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  createdBy?: string; // 'system', 'admin_user_id', 'api_call'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}