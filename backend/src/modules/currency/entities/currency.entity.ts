import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('currencies')
export class CurrencyEntity {
  @PrimaryColumn('varchar')
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({ type: 'varchar', nullable: true })
  countryCode?: string;

  @Column({ type: 'int', default: 2 })
  decimalPlaces: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
