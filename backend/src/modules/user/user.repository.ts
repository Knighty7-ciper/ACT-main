import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    return this.find({ where: { role } });
  }

  async findWithRelations(id: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['wallets', 'transactions'],
    });
  }
}
