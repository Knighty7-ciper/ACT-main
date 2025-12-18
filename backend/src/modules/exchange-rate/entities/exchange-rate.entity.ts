import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('exchange_rates')
@Index(['fromCurrency', 'toCurrency'])
export class ExchangeRateEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  fromCurrency: string;

  @Column({ type: 'varchar' })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  bid?: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  ask?: number;

  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
