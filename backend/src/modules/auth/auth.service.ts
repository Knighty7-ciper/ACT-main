import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenDto } from './dto/token.dto';
import { UserEntity } from '../user/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../email/email.service';
import { CryptoUtil } from '../../shared/utils/crypto.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private walletService: WalletService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await CryptoUtil.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpiry = new Date();
    emailVerificationTokenExpiry.setHours(emailVerificationTokenExpiry.getHours() + 24); // 24 hour expiry

    // Create new user
    const user = this.userRepository.create({
      id: uuidv4(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isEmailVerified: false,
      isActive: true,
      role: 'user',
      emailVerificationToken,
      emailVerificationTokenExpiry,
    });

    const savedUser = await this.userRepository.save(user);

    // AUTO-CREATE DEFAULT WALLETS for major currencies
    await this.createDefaultWallets(savedUser.id);

    // Send welcome email and verification email
    await this.emailService.sendWelcomeEmail(savedUser);
    await this.emailService.sendVerificationEmail(savedUser);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    return {
      accessToken: token,
      email: savedUser.email,
      userId: savedUser.id,
      emailVerificationRequired: true,
    };
  }

  private async createDefaultWallets(userId: string): Promise<void> {
    const defaultCurrencies = [
      { code: 'ACT', name: 'African Currency Token', isPrimary: true },
      { code: 'NGN', name: 'Nigerian Naira', isPrimary: false },
      { code: 'KES', name: 'Kenyan Shilling', isPrimary: false },
      { code: 'ZAR', name: 'South African Rand', isPrimary: false },
      { code: 'GHS', name: 'Ghanaian Cedi', isPrimary: false },
      { code: 'USD', name: 'US Dollar', isPrimary: false },
    ];

    for (const currency of defaultCurrencies) {
      try {
        const address = this.generateWalletAddress(currency.code);
        
        await this.walletService.create(userId, {
          currencyCode: currency.code,
          address,
          walletType: 'traditional',
        });

        // Auto-verify the ACT wallet as it's the primary currency
        if (currency.isPrimary) {
          const wallets = await this.walletService.findAllByUser(userId);
          const actWallet = wallets.find(w => w.currencyCode === 'ACT');
          if (actWallet) {
            await this.walletService.verify(actWallet.id);
          }
        }
      } catch (error) {
        console.warn(`Failed to create wallet for ${currency.code}:`, error instanceof Error ? error.message : 'Unknown error');
        // Continue with other wallets even if one fails
      }
    }
  }

  private generateWalletAddress(currencyCode: string): string {
    // Generate unique wallet address based on currency and timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${currencyCode}_${timestamp}_${random}`;
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await CryptoUtil.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      accessToken: token,
      email: user.email,
      userId: user.id,
    };
  }

  private generateToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyEmail(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return {
        success: false,
        message: 'Email is already verified',
      };
    }

    if (!user.emailVerificationToken || user.emailVerificationToken !== token) {
      throw new BadRequestException('Invalid verification token');
    }

    if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await this.userRepository.save(user);

    // Send confirmation email
    await this.emailService.sendEmailConfirmedEmail(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return {
        success: false,
        message: 'Email is already verified',
      };
    }

    // Generate new verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpiry = new Date();
    emailVerificationTokenExpiry.setHours(emailVerificationTokenExpiry.getHours() + 24);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(user);

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  }
}
