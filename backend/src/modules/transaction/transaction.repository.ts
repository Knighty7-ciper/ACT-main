import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> {
  constructor(private dataSource: DataSource) {
    super(TransactionEntity, dataSource.createEntityManager());
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<[TransactionEntity[], number]> {
    const skip = (page - 1) * limit;
    return this.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<TransactionEntity[]> {
    return this.find({ where: { status } });
  }

  async findByWalletId(walletId: string): Promise<TransactionEntity[]> {
    return this.find({ where: { walletId } });
  }

  async findByCurrency(fromCurrency: string, toCurrency: string): Promise<TransactionEntity[]> {
    return this.find({
      where: { fromCurrency, toCurrency },
    });
  }

  async findPendingTransactions(): Promise<TransactionEntity[]> {
    return this.find({ where: { status: 'pending' } });
  }
}
