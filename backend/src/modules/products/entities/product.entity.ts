import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  productCode: string;

  @Column({ type: 'varchar' })
  productName: string;

  @Column({ type: 'varchar' })
  productCategory: string; // 'Staples', 'Energy', 'Telecom', 'Transport'

  @Column({ type: 'varchar' })
  unit: string; // 'kg', 'L', 'GB', 'kWh', 'minute', 'km'

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  internationalStandard?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}