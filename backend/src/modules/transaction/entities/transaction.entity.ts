import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { WalletEntity } from '../../wallet/entities/wallet.entity';
import { JsonData } from '../../../../types/index';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  walletId?: string;

  @Column({ type: 'varchar' })
  type: string; // 'transfer', 'exchange', 'deposit', 'withdrawal'

  @Column({ type: 'varchar' })
  fromCurrency: string;

  @Column({ type: 'varchar' })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  fromAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  toAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  fee?: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string; // 'pending', 'completed', 'failed', 'cancelled'

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  referenceNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  stellarTransactionHash?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: JsonData;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'walletId' })
  wallet?: WalletEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
