import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WalletEntity } from '../../wallet/entities/wallet.entity';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';
import { RoleEntity } from '../../role/entities/role.entity';
import { JsonData } from '../../../../types/index';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpiry?: Date;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetTokenExpiry?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  countryCode?: string;

  @Column({ type: 'varchar', nullable: true })
  referralCode?: string;

  // KYC Compliance Fields
  @Column({ type: 'varchar', default: 'unverified', nullable: false })
  kycStatus: string; // 'unverified', 'pending', 'verified', 'rejected', 'expired'

  @Column({ type: 'varchar', default: 'basic' })
  verificationLevel: string; // 'basic', 'enhanced', 'vip'

  @Column({ type: 'varchar', nullable: true })
  kycProviderId?: string;

  @Column({ type: 'timestamp', nullable: true })
  kycVerifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  kycExpiryDate?: Date;

  @Column({ type: 'boolean', default: false })
  sanctionsScreeningPassed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sanctionsScreeningDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  sanctionsScreeningResult?: string; // 'clear', 'match', 'review_required'

  @Column({ type: 'boolean', default: false })
  isPEP: boolean; // Politically Exposed Person

  @Column({ type: 'json', nullable: true })
  pepDetails?: JsonData; // PEP role, institution, country details

  @Column({ type: 'varchar', nullable: true })
  pepCategory?: string; // 'domestic', 'foreign', 'family_member', 'close_associate'

  @Column({ type: 'varchar', nullable: true })
  sourceOfFunds?: string; // 'employment', 'business', 'investment', 'inheritance', 'other'

  @Column({ type: 'json', nullable: true })
  sourceOfFundsDetails?: JsonData; // Details about source documentation

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  expectedAnnualIncome?: number;

  @Column({ type: 'varchar', nullable: true })
  occupation?: string;

  @Column({ type: 'varchar', nullable: true })
  employerName?: string;

  @Column({ type: 'varchar', nullable: true })
  businessType?: string;

  @Column({ type: 'boolean', default: false })
  isHighRiskJurisdiction: boolean;

  @Column({ type: 'varchar', nullable: true })
  riskRating?: string; // 'low', 'medium', 'high', 'critical'

  @Column({ type: 'json', nullable: true })
  complianceNotes?: JsonData; // Manual review notes, restrictions, etc.

  @Column({ type: 'timestamp', nullable: true })
  lastComplianceReview?: Date;

  @Column({ type: 'varchar', nullable: true })
  complianceReviewer?: string; // Admin ID who performed review

  @OneToMany(() => WalletEntity, (wallet) => wallet.user, { cascade: true })
  wallets: WalletEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user, { cascade: true })
  transactions: TransactionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
