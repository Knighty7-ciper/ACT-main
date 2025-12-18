import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('economic_indicators')
@Index(['countryCode', 'indicatorType'])
export class EconomicIndicatorEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  countryCode: string;

  @Column({ type: 'varchar' })
  indicatorType: string; // 'gdp', 'inflation', 'unemployment', etc.

  @Column({ type: 'varchar' })
  indicatorName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  value: number;

  @Column({ type: 'varchar', nullable: true })
  unit?: string;

  @Column({ type: 'varchar', nullable: true })
  period?: string; // 'Q1 2024', 'Jan 2024', etc.

  @Column({ type: 'text', nullable: true })
  source?: string;

  @Column({ type: 'timestamp', nullable: true })
  releaseDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
