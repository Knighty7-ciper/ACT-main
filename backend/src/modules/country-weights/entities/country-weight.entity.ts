import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CountryEntity } from '../../country/entities/country.entity';

@Entity('country_weights')
export class CountryWeightEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CountryEntity)
  @JoinColumn({ name: 'country_code' })
  country: CountryEntity;

  @Column({ type: 'varchar' })
  countryCode: string;

  @Column({ type: 'varchar' })
  countryName: string;

  @Column({ type: 'varchar', nullable: true })
  region?: string; // 'North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa'

  @Column({ type: 'decimal', precision: 8, scale: 6 })
  gdpWeight: number;

  @Column({ type: 'decimal', precision: 8, scale: 6 })
  populationWeight: number;

  @Column({ type: 'decimal', precision: 8, scale: 6 })
  compositeWeight: number; // (gdp_weight + population_weight) / 2

  @Column({ type: 'varchar', nullable: true })
  economicTier?: string; // 'developed', 'emerging', 'developing'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  calculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}