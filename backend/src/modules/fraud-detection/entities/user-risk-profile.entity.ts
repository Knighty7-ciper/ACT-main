import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('user_risk_profiles')
export class UserRiskProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('numeric', { precision: 5, scale: 2 })
  overallRiskScore: number;

  @Column('numeric', { precision: 5, scale: 2 })
  transactionRisk: number;

  @Column('numeric', { precision: 5, scale: 2 })
  behavioralRisk: number;

  @Column('numeric', { precision: 5, scale: 2 })
  geographicRisk: number;

  @Column('numeric', { precision: 5, scale: 2 })
  velocityRisk: number;

  @Column('integer')
  lastTransactionCount: number;

  @Column('integer')
  last24hTransactionCount: number;

  @Column('numeric', { precision: 18, scale: 8 })
  avgTransactionAmount: number;

  @Column('varchar')
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  @Column('boolean')
  isFlagged: boolean;

  @Column('timestamptz', { nullable: true })
  flaggedAt: Date | null;

  @Column('timestamptz', { nullable: true })
  unflaggedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}