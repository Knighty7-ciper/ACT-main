import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('product_parity_results')
export class ProductParityResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'date' })
  calculationDate: Date;

  // Parity metrics
  @Column({ type: 'decimal', precision: 15, scale: 6 })
  weightedAvgUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  simpleAvgUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0 })
  standardDeviation: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  minPriceUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  maxPriceUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0 })
  priceVariance: number;

  // Country coverage
  @Column({ type: 'int', default: 0 })
  countriesIncluded: number;

  @Column({ type: 'int', default: 0 })
  dataPointsCount: number;

  // Quality indicators
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  dataQualityScore: number;

  @Column({ type: 'boolean', default: false })
  outlierFlag: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}