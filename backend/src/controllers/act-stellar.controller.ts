import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger
} from '@nestjs/common';
import { ACTStellarService } from '../services/act-stellar.service';

@Controller('act-stellar')
export class ACTStellarController {
  private readonly logger = new Logger(ACTStellarController.name);

  constructor(private readonly actStellarService: ACTStellarService) {}

  /**
   * GET ISSUER ACCOUNT INFO
   * Returns ACT issuer account details and configuration
   */
  @Get('issuer')
  async getIssuerInfo(): Promise<any> {
    try {
      const issuer = await this.actStellarService.createACTIssuer();
      return {
        success: true,
        data: issuer
      };
    } catch (error) {
      this.logger.error('Failed to get issuer info', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * CREATE WALLET WITH ACT TRUSTLINE
   * Creates new Stellar account and establishes ACT trustline
   */
  @Post('wallet/create')
  async createWallet(@Body() body: { userId: string }) {
    try {
      const { userId } = body;
      
      if (!userId) {
        return {
          success: false,
          error: 'userId is required'
        };
      }

      const wallet = await this.actStellarService.createWalletWithACT(userId);
      
      this.logger.log(`ACT wallet created for user: ${userId}`);
      
      return {
        success: true,
        data: wallet
      };
    } catch (error) {
      this.logger.error('User wallet creation failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * GET ACCOUNT BALANCE
   * Returns ACT and XLM balances for specified account
   */
  @Get('balance/:publicKey')
  async getBalance(@Param('publicKey') publicKey: string) {
    try {
      const balance = await this.actStellarService.getBalance(publicKey);
      
      return {
        success: true,
        data: balance
      };
    } catch (error) {
      this.logger.error('Balance retrieval failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * TRANSFER ACT TOKENS
   * Transfer ACT between accounts with optional memo
   */
  @Post('transfer')
  async transferACT(@Body() body: { 
    fromSecret: string; 
    toPublicKey: string; 
    amount: string; 
    memo?: string; 
  }) {
    try {
      const { fromSecret, toPublicKey, amount, memo } = body;
      
      if (!fromSecret || !toPublicKey || !amount) {
        return {
          success: false,
          error: 'fromSecret, toPublicKey, and amount are required'
        };
      }

      const result = await this.actStellarService.transferACT(fromSecret, toPublicKey, amount, memo);
      
      this.logger.log(`ACT transfer completed: ${amount} ACT`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error('ACT transfer failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * GET PLATFORM STATISTICS
   * Returns overall ACT platform metrics and stats
   */
  @Get('stats')
  async getPlatformStats(): Promise<any> {
    try {
      const stats = await this.actStellarService.getPlatformStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.logger.error('Stats retrieval failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * GET NETWORK STATUS
   * Returns Stellar network health and fee information
   */
  @Get('network-status')
  async getNetworkStatus(): Promise<any> {
    try {
      const status = await this.actStellarService.getNetworkStatus();
      
      return {
        success: true,
        data: status
      };
    } catch (error) {
      this.logger.error('Network status check failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * GET TRUSTLINE STATUS
   * Checks if account has established ACT trustline
   */
  @Get('trustline/:publicKey')
  async getTrustlineStatus(@Param('publicKey') publicKey: string) {
    try {
      const trustline = await this.actStellarService.getTrustlineStatus(publicKey);
      
      return {
        success: true,
        data: trustline
      };
    } catch (error) {
      this.logger.error('Trustline verification failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}