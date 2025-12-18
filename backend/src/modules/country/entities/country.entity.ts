import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class CountryEntity {
  @PrimaryColumn('varchar')
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  region?: string;

  @Column({ type: 'varchar', nullable: true })
  subregion?: string;

  @Column({ type: 'varchar', nullable: true })
  currencyCode?: string;

  @Column({ type: 'varchar', nullable: true })
  phoneCode?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
