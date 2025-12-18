import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';

@Injectable()
export class WalletRepository extends Repository<WalletEntity> {
  constructor(private dataSource: DataSource) {
    super(WalletEntity, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<WalletEntity[]> {
    return this.find({ where: { userId } });
  }

  async findByCurrency(userId: string, currencyCode: string): Promise<WalletEntity | null> {
    return this.findOne({
      where: { userId, currencyCode },
    });
  }

  async findByAddress(address: string): Promise<WalletEntity | null> {
    return this.findOne({ where: { address } });
  }

  async findActiveWallets(userId: string): Promise<WalletEntity[]> {
    return this.find({
      where: { userId, isActive: true },
    });
  }

  async findVerifiedWallets(userId: string): Promise<WalletEntity[]> {
    return this.find({
      where: { userId, isVerified: true, isActive: true },
    });
  }
}
