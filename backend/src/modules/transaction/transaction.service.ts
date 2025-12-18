import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { UserEntity } from '../user/entities/user.entity';
import { FraudDetectionService } from '../fraud-detection/fraud-detection.service';
import { RealTimeEventsService } from '../../services/real-time-events.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private fraudDetectionService: FraudDetectionService,
    private realTimeEventsService: RealTimeEventsService,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
    fraudAnalysisData?: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      locationLat?: number;
      locationLng?: number;
      countryCode?: string;
    }
  ): Promise<TransactionResponseDto> {
    const { type, fromCurrency, toCurrency, fromAmount, toAmount, walletId, description } =
      createTransactionDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (walletId) {
      const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }
      if (wallet.balance < fromAmount) {
        throw new BadRequestException('Insufficient balance');
      }
    }

    // Generate transaction ID first for fraud analysis
    const transactionId = uuidv4();
    
    // Perform fraud detection analysis
    const fraudAnalysis = await this.fraudDetectionService.analyzeTransaction({
      transactionId,
      userId,
      amount: fromAmount,
      currency: fromCurrency,
      ...fraudAnalysisData
    });

    // Block transaction if fraud risk is too high
    if (!fraudAnalysis.approved && !fraudAnalysis.requiresReview) {
      throw new ForbiddenException('Transaction blocked due to high fraud risk');
    }

    const transaction = this.transactionRepository.create({
      id: transactionId,
      userId,
      walletId,
      type,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      description,
      status: fraudAnalysis.approved ? 'pending' : 'review_required',
      referenceNumber: `TXN-${Date.now()}`,
      metadata: {
        fraudAnalysis,
        requiresReview: fraudAnalysis.requiresReview,
        riskScore: fraudAnalysis.riskScore,
        riskFactors: fraudAnalysis.riskFactors
      }
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Broadcast real-time transaction event
    this.realTimeEventsService.streamTransactionCreated({
      id: savedTransaction.id,
      userId: savedTransaction.userId,
      amount: savedTransaction.fromAmount,
      currency: savedTransaction.fromCurrency,
      type: savedTransaction.type,
      status: savedTransaction.status,
      metadata: {
        toCurrency: savedTransaction.toCurrency,
        toAmount: savedTransaction.toAmount,
        description: savedTransaction.description,
        fraudAnalysis: fraudAnalysis
      }
    });

    return this.toResponseDto(savedTransaction);
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: transactions.map((tx) => this.toResponseDto(tx)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(transactionId: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return this.toResponseDto(transaction);
  }

  async update(
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    Object.assign(transaction, updateTransactionDto);
    if (updateTransactionDto.status === 'completed') {
      transaction.completedAt = new Date();
    }

    const updatedTransaction = await this.transactionRepository.save(transaction);

    // Broadcast real-time transaction update
    if (updateTransactionDto.status === 'completed') {
      this.realTimeEventsService.streamTransactionCompleted({
        id: updatedTransaction.id,
        userId: updatedTransaction.userId,
        amount: updatedTransaction.fromAmount,
        currency: updatedTransaction.fromCurrency,
        type: updatedTransaction.type,
        metadata: {
          toCurrency: updatedTransaction.toCurrency,
          toAmount: updatedTransaction.toAmount,
          description: updatedTransaction.description,
          processingTime: Date.now() - updatedTransaction.createdAt.getTime()
        }
      });
    } else if (updateTransactionDto.status === 'failed') {
      this.realTimeEventsService.streamTransactionFailed({
        id: updatedTransaction.id,
        userId: updatedTransaction.userId,
        amount: updatedTransaction.fromAmount,
        currency: updatedTransaction.fromCurrency,
        type: updatedTransaction.type,
        error: updateTransactionDto.metadata?.error || 'Transaction failed',
        metadata: {
          toCurrency: updatedTransaction.toCurrency,
          toAmount: updatedTransaction.toAmount,
          description: updatedTransaction.description
        }
      });
    }

    return this.toResponseDto(updatedTransaction);
  }

  async getHistory(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    return this.findByUser(userId, page, limit);
  }

  async getStatus(transactionId: string): Promise<any> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return {
      id: transaction.id,
      status: transaction.status,
      updatedAt: transaction.updatedAt,
      completedAt: transaction.completedAt,
    };
  }

  private toResponseDto(transaction: TransactionEntity): TransactionResponseDto {
    return {
      id: transaction.id,
      userId: transaction.userId,
      walletId: transaction.walletId,
      type: transaction.type,
      fromCurrency: transaction.fromCurrency,
      toCurrency: transaction.toCurrency,
      fromAmount: transaction.fromAmount,
      toAmount: transaction.toAmount,
      fee: transaction.fee,
      status: transaction.status,
      description: transaction.description,
      referenceNumber: transaction.referenceNumber,
      stellarTransactionHash: transaction.stellarTransactionHash,
      completedAt: transaction.completedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
