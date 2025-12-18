import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AdminEntity } from './entities/admin.entity';
import { UserEntity } from '../user/entities/user.entity';
import { TransactionEntity } from '../transaction/entities/transaction.entity';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { UserRequestEntity } from '../../entities/user-request.entity';
import { AdminAccess } from '../../entities/admin-access.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CryptoUtil } from '../../shared/utils/crypto.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserRequestEntity)
    private userRequestRepository: Repository<UserRequestEntity>,
    @InjectRepository(AdminAccess)
    private adminAccessRepository: Repository<AdminAccess>,
    private jwtService: JwtService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    const { email, password, firstName, lastName, adminLevel, permissions } =
      createAdminDto;

    const existing = await this.adminRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Admin email already exists');
    }

    const hashedPassword = await CryptoUtil.hashPassword(password);

    const admin = this.adminRepository.create({
      id: uuidv4(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      adminLevel: adminLevel || 'admin',
      permissions: permissions || [],
      isActive: true,
      role: 'admin',
    });

    const saved = await this.adminRepository.save(admin);
    return this.toResponseDto(saved);
  }

  async login(loginAdminDto: LoginAdminDto): Promise<{ accessToken: string; admin: AdminResponseDto }> {
    const { email, password } = loginAdminDto;

    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await CryptoUtil.comparePasswords(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is disabled');
    }

    admin.lastLoginAt = new Date();
    await this.adminRepository.save(admin);

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      adminLevel: admin.adminLevel,
    });

    return {
      accessToken: token,
      admin: this.toResponseDto(admin),
    };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [admins, total] = await this.adminRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: admins.map((a) => this.toResponseDto(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AdminResponseDto> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return this.toResponseDto(admin);
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<AdminResponseDto> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await CryptoUtil.hashPassword(updateAdminDto.password);
    }

    Object.assign(admin, updateAdminDto);
    const updated = await this.adminRepository.save(admin);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    await this.adminRepository.remove(admin);
  }

  async deactivate(id: string): Promise<AdminResponseDto> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    admin.isActive = false;
    const updated = await this.adminRepository.save(admin);
    return this.toResponseDto(updated);
  }

  private toResponseDto(admin: AdminEntity): AdminResponseDto {
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      adminLevel: admin.adminLevel,
      isActive: admin.isActive,
      permissions: admin.permissions,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  // === ENHANCED ADMIN METHODS ===

  async getUserRequests(page: number = 1, limit: number = 10, filters?: any): Promise<any> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.userRequestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.assignedToAdmin', 'assignedAdmin');

    // Apply filters
    if (filters?.status) {
      queryBuilder.andWhere('request.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      queryBuilder.andWhere('request.priority = :priority', { priority: filters.priority });
    }

    const [requests, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('request.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async assignUserRequest(requestId: string, adminId: string): Promise<any> {
    const request = await this.userRequestRepository.findOne({ 
      where: { id: requestId },
      relations: ['user', 'assignedToAdmin']
    });

    if (!request) {
      throw new NotFoundException('User request not found');
    }

    // Verify admin exists
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    request.assignedToAdminId = adminId;
    request.status = 'in_progress';
    
    const updated = await this.userRequestRepository.save(request);
    
    return {
      requestId,
      assignedTo: adminId,
      status: 'in_progress',
      assignedAt: new Date(),
      message: 'Request assigned successfully',
      assignedRequest: {
        id: updated.id,
        subject: updated.subject,
        priority: updated.priority,
        userEmail: request.user?.email,
        userName: `${request.user?.firstName} ${request.user?.lastName}`.trim()
      }
    };
  }

  async resolveUserRequest(requestId: string, resolution: any): Promise<any> {
    const request = await this.userRequestRepository.findOne({ 
      where: { id: requestId },
      relations: ['user', 'assignedToAdmin']
    });

    if (!request) {
      throw new NotFoundException('User request not found');
    }

    // Update request resolution
    request.status = 'resolved';
    request.resolutionNotes = resolution.notes;
    request.resolvedByAdminId = resolution.adminId;
    request.resolvedAt = new Date();
    request.internalNotes = resolution.internalNotes;
    
    const updated = await this.userRequestRepository.save(request);

    return {
      requestId,
      resolution: resolution.action,
      status: 'resolved',
      resolvedAt: request.resolvedAt,
      resolvedBy: resolution.adminId,
      notes: resolution.notes,
      message: 'Request resolved successfully',
      resolvedRequest: {
        id: updated.id,
        subject: updated.subject,
        userEmail: request.user?.email,
        userName: `${request.user?.firstName} ${request.user?.lastName}`.trim(),
        resolutionNotes: updated.resolutionNotes,
        resolutionTime: request.resolvedAt ? 
          Math.floor((request.resolvedAt.getTime() - request.createdAt.getTime()) / (1000 * 60 * 60)) : 
          null // hours
      }
    };
  }

  async getUsersSummary(): Promise<any> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get real user statistics from database
    const [
      totalUsers,
      activeUsers,
      newUsers24h,
      newUsers7d,
      newUsers30d,
      usersByKycLevel,
      usersByCountry,
      suspendedUsers,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { createdAt: MoreThan(last24h) } }),
      this.userRepository.count({ where: { createdAt: MoreThan(last7d) } }),
      this.userRepository.count({ where: { createdAt: MoreThan(last30d) } }),
      this.userRepository
        .createQueryBuilder('user')
        .select('user.kycLevel', 'level')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.kycLevel')
        .getRawMany(),
      this.userRepository
        .createQueryBuilder('user')
        .select('user.country', 'country')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.country')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
      this.userRepository.count({ where: { isActive: false } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsers24h,
      newUsers7d,
      newUsers30d,
      usersByKycLevel: usersByKycLevel.reduce((acc, item) => {
        acc[item.level || 'unknown'] = parseInt(item.count);
        return acc;
      }, {}),
      topCountries: usersByCountry.reduce((acc, item) => {
        acc[item.country || 'unknown'] = parseInt(item.count);
        return acc;
      }, {}),
      growth: {
        daily: newUsers24h,
        weekly: newUsers7d,
        monthly: newUsers30d,
      },
      timestamp: now,
    };
  }

  async getTransactionsSummary(): Promise<any> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get real transaction statistics from database
    const [
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      transactions24h,
      transactions7d,
      transactions30d,
      volumeByCurrency,
      transactionsByStatus,
      avgTransactionValue,
      topSendingUsers,
      topReceivingUsers,
    ] = await Promise.all([
      this.transactionRepository.count(),
      this.transactionRepository.count({ where: { status: 'completed' } }),
      this.transactionRepository.count({ where: { status: 'failed' } }),
      this.transactionRepository.count({ where: { status: 'pending' } }),
      this.transactionRepository.count({ where: { createdAt: MoreThan(last24h) } }),
      this.transactionRepository.count({ where: { createdAt: MoreThan(last7d) } }),
      this.transactionRepository.count({ where: { createdAt: MoreThan(last30d) } }),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.currency', 'currency')
        .addSelect('SUM(transaction.amount)', 'totalVolume')
        .addSelect('COUNT(*)', 'count')
        .where('transaction.status = :status', { status: 'completed' })
        .groupBy('transaction.currency')
        .getRawMany(),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('transaction.status')
        .getRawMany(),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('AVG(transaction.amount)', 'avgAmount')
        .where('transaction.status = :status', { status: 'completed' })
        .getRawOne(),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.senderId', 'userId')
        .addSelect('SUM(transaction.amount)', 'totalSent')
        .addSelect('COUNT(*)', 'transactionCount')
        .where('transaction.status = :status', { status: 'completed' })
        .groupBy('transaction.senderId')
        .orderBy('totalSent', 'DESC')
        .limit(10)
        .getRawMany(),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.recipientId', 'userId')
        .addSelect('SUM(transaction.amount)', 'totalReceived')
        .addSelect('COUNT(*)', 'transactionCount')
        .where('transaction.status = :status', { status: 'completed' })
        .groupBy('transaction.recipientId')
        .orderBy('totalReceived', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      transactions24h,
      transactions7d,
      transactions30d,
      volumeByCurrency: volumeByCurrency.reduce((acc, item) => {
        acc[item.currency] = {
          totalVolume: parseFloat(item.totalVolume),
          count: parseInt(item.count),
        };
        return acc;
      }, {}),
      transactionsByStatus: transactionsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      avgTransactionValue: parseFloat(avgTransactionValue?.avgAmount || '0'),
      topSendingUsers: topSendingUsers.map(item => ({
        userId: item.userId,
        totalSent: parseFloat(item.totalSent),
        transactionCount: parseInt(item.transactionCount),
      })),
      topReceivingUsers: topReceivingUsers.map(item => ({
        userId: item.userId,
        totalReceived: parseFloat(item.totalReceived),
        transactionCount: parseInt(item.transactionCount),
      })),
      successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
      growth: {
        daily: transactions24h,
        weekly: transactions7d,
        monthly: transactions30d,
      },
      timestamp: now,
    };
  }

  /**
   * Validate admin access question and answer
   */
  async validateAdminAccess(answer: string): Promise<{ valid: boolean; message: string }> {
    try {
      const adminAccess = await this.adminAccessRepository.findOne({ 
        where: { isActive: true } 
      });

      if (!adminAccess) {
        return { valid: false, message: 'Admin access system not configured' };
      }

      // Case-insensitive comparison
      if (adminAccess.answer.toLowerCase().trim() === answer.toLowerCase().trim()) {
        return { valid: true, message: 'Admin access granted' };
      }

      return { valid: false, message: 'Incorrect answer' };
    } catch (error) {
      return { valid: false, message: 'Error validating admin access' };
    }
  }

  /**
   * Get admin access question
   */
  async getAdminAccessQuestion(): Promise<{ question: string; requiredClicks: number }> {
    const adminAccess = await this.adminAccessRepository.findOne({ 
      where: { isActive: true } 
    });

    if (!adminAccess) {
      throw new NotFoundException('Admin access system not configured');
    }

    return {
      question: adminAccess.question,
      requiredClicks: adminAccess.requiredClicks,
    };
  }
}
