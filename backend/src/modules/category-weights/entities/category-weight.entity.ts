import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('category_weights')
export class CategoryWeightEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  categoryName: string; // 'Staples', 'Energy', 'Telecom', 'Transport'

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  weight: number; // 0.4500, 0.3000, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: 'household_survey' })
  calculationMethod: string; // 'household_survey', 'trade_volume', 'strategic_importance'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'date' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}