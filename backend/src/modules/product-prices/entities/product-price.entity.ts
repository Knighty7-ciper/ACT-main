import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { CountryEntity } from '../../country/entities/country.entity';
import { CurrencyEntity } from '../../currency/entities/currency.entity';

@Entity('product_prices')
export class ProductPriceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => CountryEntity)
  @JoinColumn({ name: 'country_code' })
  country: CountryEntity;

  @Column({ type: 'varchar' })
  countryCode: string;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currency_code' })
  currency: CurrencyEntity;

  @Column({ type: 'varchar' })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  priceLocal: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  usdRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, nullable: true })
  priceUsdNormalized?: number;

  @Column({ type: 'varchar', nullable: true })
  dataSource?: string;

  @Column({ type: 'date' })
  collectionDate: Date;

  @Column({ type: 'varchar', default: 'retail' })
  marketType: string; // 'retail', 'wholesale', 'official'

  @Column({ type: 'varchar', default: 'standard' })
  qualityGrade: string; // 'premium', 'standard', 'basic'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}