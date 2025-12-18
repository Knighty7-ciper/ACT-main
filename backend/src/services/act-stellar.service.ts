import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  Server,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Account,
  Memo,
  BASE_FEE
} from '@stellar/stellar-sdk';
import { getStellarConfig, getStellarKeypair } from '../config/stellar.config';

/**
 * Simplified ACT Token Service for PESA-AFRIK Platform
 * Core functionality focused on ACT token operations
 */
@Injectable()
export class ACTStellarService {
  private readonly logger = new Logger(ACTStellarService.name);
  private readonly config = getStellarConfig();
  private readonly server = new Server(this.config.horizonUrl);
  
  // ACT Token Configuration
  private readonly ACT_ASSET = new Asset('ACT', this.config.publicKey);
  private readonly NETWORK_PASSPHRASE = this.config.networkPassphrase;

  /**
   * Create ACT issuer account
   */
  async createACTIssuer(): Promise<{ issuerAccount: string; sequence: string; network: string; actAsset: { code: string; issuer: string } }> {
    try {
      const issuerKeypair = getStellarKeypair();
      const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());
      
      return {
        issuerAccount: issuerKeypair.publicKey(),
        sequence: issuerAccount.sequence,
        network: this.config.networkPassphrase,
        actAsset: {
          code: 'ACT',
          issuer: issuerKeypair.publicKey()
        }
      };
    } catch (error) {
      this.logger.error('Failed to create ACT issuer', error);
      throw new BadRequestException(`ACT issuer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create wallet with ACT trustline
   */
  async createWalletWithACT(userId: string) {
    try {
      const keypair = Keypair.random();
      
      // Fund with testnet XLM using Friendbot
      const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
      try {
        await fetch(friendbotUrl);
        this.logger.log(`Account funded: ${keypair.publicKey()}`);
      } catch (fundingError) {
        this.logger.warn(`Funding failed for ${keypair.publicKey()}: ${fundingError}`);
      }
      
      // Establish ACT trustline
      const trustlineTxn = new TransactionBuilder(await this.server.loadAccount(keypair.publicKey()), {
        fee: BASE_FEE,
        networkPassphrase: this.NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.changeTrust({
            asset: this.ACT_ASSET,
            source: keypair.publicKey(),
          })
        )
        .setTimeout(30)
        .build();
      
      trustlineTxn.sign(keypair);
      await this.server.submitTransaction(trustlineTxn);
      
      this.logger.log(`ACT wallet created for user ${userId}: ${keypair.publicKey()}`);
      
      return {
        publicKey: keypair.publicKey(),
        secret: keypair.secret(),
        userId,
        actTrustline: true
      };
    } catch (error) {
      this.logger.error(`Wallet creation failed for user ${userId}`, error);
      throw new BadRequestException(`Wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get balance for account
   */
  async getBalance(publicKey: string) {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      const actBalance = account.balances.find((balance: any) => 
        balance.asset_type === 'credit_alphanum4' && 
        balance.asset_code === 'ACT' &&
        balance.asset_issuer === this.config.publicKey
      );

      const xlmBalance = account.balances.find((balance: any) => 
        balance.asset_type === 'native'
      );

      return {
        actBalance: actBalance ? actBalance.balance : '0',
        xlmBalance: xlmBalance ? xlmBalance.balance : '0',
        accountStatus: 'active'
      };
    } catch (error) {
      this.logger.error(`Balance check failed for ${publicKey}`, error);
      throw new BadRequestException(`Balance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer ACT between accounts
   */
  async transferACT(fromSecret: string, toPublicKey: string, amount: string, memo?: string) {
    try {
      const fromKeypair = Keypair.fromSecret(fromSecret);
      const fromPublicKey = fromKeypair.publicKey();
      
      // Load sender account
      const senderAccount = await this.server.loadAccount(fromPublicKey);

      // Verify ACT trustline exists
      const actTrustline = senderAccount.balances.find((balance: any) => 
        balance.asset_type === 'credit_alphanum4' && 
        balance.asset_code === 'ACT' &&
        balance.asset_issuer === this.config.publicKey
      );

      if (!actTrustline) {
        throw new BadRequestException('ACT trustline not found on sender account');
      }

      const transferTxn = new TransactionBuilder(senderAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.payment({
            destination: toPublicKey,
            asset: this.ACT_ASSET,
            amount: amount,
            source: fromPublicKey,
          })
        )
        .addMemo(memo ? Memo.text(memo) : Memo.none())
        .setTimeout(60)
        .build();

      transferTxn.sign(fromKeypair);
      const result = await this.server.submitTransaction(transferTxn);
      
      this.logger.log(`ACT transfer completed: ${amount} ACT from ${fromPublicKey} to ${toPublicKey}`);
      
      return {
        success: true,
        transactionHash: result.hash,
        amount,
        from: fromPublicKey,
        to: toPublicKey
      };
    } catch (error) {
      this.logger.error('ACT transfer failed', error);
      throw new BadRequestException(`ACT transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<{ network: string; issuer: string; actAsset: { code: string; issuer: string }; issuerActBalance: string; totalTrustlines: number; networkPassphrase: string }> {
    try {
      // Get issuer account stats
      const issuerAccount = await this.server.loadAccount(this.config.publicKey);
      
      // Find ACT balance on issuer account
      const issuerActBalance = issuerAccount.balances.find((balance: any) => 
        balance.asset_type === 'credit_alphanum4' && 
        balance.asset_code === 'ACT'
      );

      return {
        network: 'Stellar Testnet',
        issuer: this.config.publicKey,
        actAsset: {
          code: 'ACT',
          issuer: this.config.publicKey
        },
        issuerActBalance: issuerActBalance ? issuerActBalance.balance : '0',
        totalTrustlines: issuerAccount.balances.filter((b: any) => b.asset_type !== 'native').length,
        networkPassphrase: this.config.networkPassphrase
      };
    } catch (error) {
      this.logger.error('Stats retrieval failed', error);
      throw new BadRequestException(`Stats retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<{ network: string; horizonUrl: string; networkPassphrase: string; latestLedger: string; feeStats: { last_ledger_base_fee: number; ledger_capacity_usage: number; max_fee: number }; status: string }> {
    try {
      const feeStats = await this.server.feeStats();
      const latestLedger = await this.server.ledgers().order('desc').limit(1).call();
      
      return {
        network: 'Stellar Testnet',
        horizonUrl: this.config.horizonUrl,
        networkPassphrase: this.config.networkPassphrase,
        latestLedger: latestLedger.records[0]?.sequence || 'Unknown',
        feeStats: {
          last_ledger_base_fee: feeStats.last_ledger_base_fee,
          ledger_capacity_usage: feeStats.ledger_capacity_usage,
          max_fee: feeStats.max_fee
        },
        status: 'operational'
      };
    } catch (error) {
      this.logger.error('Network status check failed', error);
      throw new BadRequestException(`Network status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check trustline status
   */
  async getTrustlineStatus(publicKey: string): Promise<{ publicKey: string; hasACTTrustline: boolean; actBalance: string; limit: string | number }> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      const actTrustline = account.balances.find((balance: any) => 
        balance.asset_type === 'credit_alphanum4' && 
        balance.asset_code === 'ACT' &&
        balance.asset_issuer === this.config.publicKey
      );

      return {
        publicKey,
        hasACTTrustline: !!actTrustline,
        actBalance: actTrustline ? actTrustline.balance : '0',
        limit: actTrustline && 'limit' in actTrustline && actTrustline.limit ? actTrustline.limit : 'unlimited'
      };
    } catch (error) {
      this.logger.error(`Trustline verification failed for ${publicKey}`, error);
      throw new BadRequestException(`Trustline verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}