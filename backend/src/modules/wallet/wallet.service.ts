import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { UserEntity } from '../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(userId: string, createWalletDto: CreateWalletDto): Promise<WalletResponseDto> {
    const { currencyCode, address, walletType } = createWalletDto;

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if wallet already exists for this currency
    const existingWallet = await this.walletRepository.findOne({
      where: { userId, currencyCode },
    });
    if (existingWallet) {
      throw new ConflictException(
        `Wallet for ${currencyCode} already exists for this user`,
      );
    }

    const wallet = this.walletRepository.create({
      id: uuidv4(),
      userId,
      currencyCode,
      address,
      walletType: walletType || 'traditional',
      balance: 0,
      isActive: true,
      isVerified: false,
    });

    const savedWallet = await this.walletRepository.save(wallet);
    return this.toResponseDto(savedWallet);
  }

  async findAllByUser(userId: string): Promise<WalletResponseDto[]> {
    const wallets = await this.walletRepository.find({ where: { userId } });
    return wallets.map((wallet) => this.toResponseDto(wallet));
  }

  async findOne(walletId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return this.toResponseDto(wallet);
  }

  async update(walletId: string, updateWalletDto: UpdateWalletDto): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    Object.assign(wallet, updateWalletDto);
    const updatedWallet = await this.walletRepository.save(wallet);
    return this.toResponseDto(updatedWallet);
  }

  async updateBalance(walletId: string, amount: number): Promise<void> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance = wallet.balance + amount;
    await this.walletRepository.save(wallet);
  }

  async verify(walletId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.isVerified = true;
    wallet.verifiedAt = new Date();
    const updatedWallet = await this.walletRepository.save(wallet);
    return this.toResponseDto(updatedWallet);
  }

  async delete(walletId: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    await this.walletRepository.remove(wallet);
  }

  private toResponseDto(wallet: WalletEntity): WalletResponseDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      address: wallet.address,
      currencyCode: wallet.currencyCode,
      balance: wallet.balance,
      isActive: wallet.isActive,
      walletType: wallet.walletType,
      isVerified: wallet.isVerified,
      verifiedAt: wallet.verifiedAt,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
