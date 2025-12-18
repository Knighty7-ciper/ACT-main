import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('transaction_risk_analysis')
export class TransactionRiskAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  transactionId: string;

  @Column('uuid')
  userId: string;

  @Column('numeric', { precision: 5, scale: 2 })
  riskScore: number;

  @Column('boolean')
  approved: boolean;

  @Column('boolean')
  requiresReview: boolean;

  @Column('jsonb')
  riskFactors: string[];

  @Column('numeric', { precision: 5, scale: 2 })
  velocityScore: number;

  @Column('numeric', { precision: 5, scale: 2 })
  geographicScore: number;

  @Column('numeric', { precision: 5, scale: 2 })
  behavioralScore: number;

  @Column('numeric', { precision: 5, scale: 2 })
  amountDeviationScore: number;

  @Column('varchar', { nullable: true })
  deviceFingerprint: string | null;

  @Column('varchar', { nullable: true })
  ipAddress: string | null;

  @Column('text', { nullable: true })
  userAgent: string | null;

  @Column('numeric', { precision: 10, scale: 6, nullable: true })
  locationLat: number | null;

  @Column('numeric', { precision: 10, scale: 6, nullable: true })
  locationLng: number | null;

  @Column('varchar', { length: 2, nullable: true })
  countryCode: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TransactionEntity, { eager: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: TransactionEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}