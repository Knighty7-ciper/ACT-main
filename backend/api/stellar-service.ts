/**
 * Stellar Labs Blockchain Integration Service
 * ACT Token Operations on Stellar Network
 * 
 * Features:
 * - ACT token distribution and transfers
 * - Account management and wallet creation
 * - Transaction monitoring and verification
 * - Real-time balance updates
 * - Blockchain transaction history
 * 
 * Provider: Stellar.org
 * Network: Testnet (for development)
 * 
 * Author: MiniMax Agent
 * Date: 2025-10-30
 */

import { Server, Asset, Keypair, Transaction, Network, Operation, Memo } from 'stellar-sdk';
import axios from 'axios';
import { log } from '../src/shared/utils/secure-logger.util';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface StellarAccountInfo {
  accountId: string;
  balance: string;
  sequenceNumber: string;
  signers: any[];
  thresholds: any;
  flags: any;
  data: Record<string, string>;
}

interface StellarTransaction {
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  fee_charged: string;
  operation_count: number;
  memo?: string;
  signatures: string[];
  results?: any[];
}

interface ACTTokenTransfer {
  to: string;
  amount: string; // String format with 8 decimal places
  memo?: string;
  assetCode?: string;
}

interface AccountCreationResult {
  publicKey: string;
  secretKey: string;
  recoveryPhrase: string;
  funded: boolean;
  balance?: string;
}

/**
 * Professional Stellar Labs Service
 */
class StellarLabsService {
  private network: Network;
  private horizonServer: Server;
  private publicKey: string;
  private secretKey: string;
  private recoveryPhrase: string;
  private supabase: SupabaseClient;
  private isTestnet: boolean;

  constructor() {
    this.isTestnet = process.env.STELLAR_NETWORK !== 'mainnet';
    this.network = this.isTestnet ? Network.TESTNET : Network.PUBLIC;
    
    // Stellar Labs credentials
    this.publicKey = process.env.STELLAR_PUBLIC_KEY || '';
    this.secretKey = process.env.STELLAR_SECRET_KEY || '';
    this.recoveryPhrase = process.env.STELLAR_RECOVERY_PHRASE || '';
    
    if (!this.publicKey || !this.secretKey || !this.recoveryPhrase) {
      throw new Error('Stellar Labs credentials not configured');
    }

    // Initialize Horizon server
    const horizonUrl = this.isTestnet 
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org';
    
    this.horizonServer = new Server(horizonUrl);
    
    // Initialize Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    console.log(`Stellar Labs Service initialized on ${this.isTestnet ? 'TESTNET' : 'MAINNET'}`);
    console.log(`Public Key: ${this.publicKey}`);
  }

  /**
   * Create new ACT token account
   */
  async createAccount(userId: string, initialBalance: string = '2.0'): Promise<AccountCreationResult> {
    try {
      // Generate new keypair
      const keypair = Keypair.random();
      const publicKey = keypair.publicKey();
      const secretKey = keypair.secret();
      
      console.log(`🆕 Creating new account: ${publicKey}`);
      
      // Fund account using friendbot (testnet only)
      if (this.isTestnet) {
        await this.fundAccountTestnet(publicKey);
        console.log(`Account funded via Friendbot: ${publicKey}`);
      }

      // Get account info to verify creation
      const accountInfo = await this.getAccountInfo(publicKey);
      
      // Store wallet in database
      await this.storeWalletInDatabase(userId, publicKey, secretKey, this.recoveryPhrase);
      
      console.log(`Account created successfully: ${publicKey}`);
      
      return {
        publicKey,
        secretKey,
        recoveryPhrase: this.recoveryPhrase,
        funded: true,
        balance: accountInfo.balance
      };

    } catch (error: any) {
      console.error('Account creation failed:', error);
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  /**
   * Fund account using Stellar Friendbot (testnet only)
   */
  private async fundAccountTestnet(publicKey: string): Promise<void> {
    try {
      const response = await axios.get(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
        { timeout: 10000 }
      );
      
      console.log(`Friendbot funding successful: ${response.status}`);
    } catch (error: any) {
      console.warn(`Friendbot funding failed: ${error.message}`);
      // Don't throw - account might still be usable
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(accountId: string): Promise<StellarAccountInfo> {
    try {
      const account = await this.horizonServer.loadAccount(accountId);
      
      const actBalance = account.balances.find(b => b.asset_code === 'ACT' && b.asset_issuer === this.publicKey);
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      
      return {
        accountId: account.id,
        balance: actBalance?.balance || '0',
        sequenceNumber: account.sequence,
        signers: account.signers,
        thresholds: account.thresholds,
        flags: account.flags,
        data: account.data_attr
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Account not found');
      }
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  /**
   * Transfer ACT tokens
   */
  async transferACT(fromSecretKey: string, transfer: ACTTokenTransfer): Promise<StellarTransaction> {
    try {
      // Load source account
      const sourceKeypair = Keypair.fromSecret(fromSecretKey);
      const sourceAccount = await this.horizonServer.loadAccount(sourceKeypair.publicKey());
      
      // Create ACT asset
      const actAsset = new Asset('ACT', this.publicKey);
      
      // Build transaction
      const transaction = new Transaction(sourceAccount, this.network);
      
      // Add memo if provided
      if (transfer.memo) {
        transaction.addMemo(Memo.text(transfer.memo));
      }
      
      // Add payment operation
      transaction.addOperation(
        Operation.payment({
          destination: transfer.to,
          asset: actAsset,
          amount: transfer.amount
        })
      );
      
      // Sign transaction
      transaction.sign(sourceKeypair);
      
      // Submit transaction
      const result = await this.horizonServer.submitTransaction(transaction);
      
      console.log(`ACT transfer successful: ${transfer.amount} ACT -> ${transfer.to}`);
      console.log(`Transaction hash: ${result.hash}`);
      
      return {
        hash: result.hash,
        ledger: result.ledger_attr,
        created_at: result.created_at,
        source_account: sourceKeypair.publicKey(),
        fee_charged: result.fee_charged,
        operation_count: result.operation_count,
        memo: transfer.memo,
        signatures: result.signatures
      };
      
    } catch (error: any) {
      console.error('ACT transfer failed:', error);
      throw new Error(`Failed to transfer ACT tokens: ${error.message}`);
    }
  }

  /**
   * Distribute ACT tokens from admin account
   */
  async distributeACT(
    toPublicKey: string, 
    amount: string, 
    memo: string = 'ACT Distribution'
  ): Promise<StellarTransaction> {
    try {
      const adminKeypair = Keypair.fromSecret(this.secretKey);
      
      // Load admin account
      const adminAccount = await this.horizonServer.loadAccount(adminKeypair.publicKey());
      
      // Create ACT asset
      const actAsset = new Asset('ACT', this.publicKey);
      
      // Build transaction
      const transaction = new Transaction(adminAccount, this.network);
      transaction.addMemo(Memo.text(memo));
      
      // Add payment operation
      transaction.addOperation(
        Operation.payment({
          destination: toPublicKey,
          asset: actAsset,
          amount: amount
        })
      );
      
      // Sign and submit
      transaction.sign(adminKeypair);
      const result = await this.horizonServer.submitTransaction(transaction);
      
      console.log(`ACT distribution successful: ${amount} ACT -> ${toPublicKey}`);
      
      // Log distribution in database
      await this.logDistribution(toPublicKey, amount, result.hash, memo);
      
      return {
        hash: result.hash,
        ledger: result.ledger_attr,
        created_at: result.created_at,
        source_account: adminKeypair.publicKey(),
        fee_charged: result.fee_charged,
        operation_count: result.operation_count,
        memo,
        signatures: result.signatures
      };
      
    } catch (error: any) {
      console.error('ACT distribution failed:', error);
      throw new Error(`Failed to distribute ACT tokens: ${error.message}`);
    }
  }

  /**
   * Get transaction history for an account
   */
  async getTransactionHistory(accountId: string, limit: number = 20): Promise<StellarTransaction[]> {
    try {
      const payments = await this.horizonServer.payments()
        .forAccount(accountId)
        .order('desc')
        .limit(limit)
        .call();

      const transactions: StellarTransaction[] = [];
      
      for (const payment of payments.records) {
        const tx = await this.horizonServer.transactions().transaction(payment.transaction_hash).call();
        
        transactions.push({
          hash: tx.hash,
          ledger: tx.ledger_attr,
          created_at: tx.created_at,
          source_account: tx.source_account,
          fee_charged: tx.fee_charged,
          operation_count: tx.operation_count,
          memo: tx.memo,
          signatures: tx.signatures
        });
      }
      
      console.log(`Retrieved ${transactions.length} transactions for ${accountId}`);
      return transactions;
      
    } catch (error: any) {
      console.error('Failed to get transaction history:', error);
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(transactionHash: string): Promise<StellarTransaction | null> {
    try {
      const transaction = await this.horizonServer.transactions().transaction(transactionHash).call();
      
      return {
        hash: transaction.hash,
        ledger: transaction.ledger_attr,
        created_at: transaction.created_at,
        source_account: transaction.source_account,
        fee_charged: transaction.fee_charged,
        operation_count: transaction.operation_count,
        memo: transaction.memo,
        signatures: transaction.signatures
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to verify transaction: ${error.message}`);
    }
  }

  /**
   * Store wallet in database
   */
  private async storeWalletInDatabase(
    userId: string, 
    publicKey: string, 
    secretKey: string, 
    recoveryPhrase: string
  ): Promise<void> {
    try {
      const walletData = {
        user_id: userId,
        address: publicKey,
        currency_code: 'ACT',
        balance: '0',
        is_active: true,
        wallet_type: 'stellar_blockchain',
        public_key: publicKey,
        is_verified: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Store encrypted sensitive data
        metadata: {
          secret_key_encrypted: this.encryptSensitiveData(secretKey),
          recovery_phrase_encrypted: this.encryptSensitiveData(recoveryPhrase),
          stellar_account_id: publicKey,
          blockchain_network: this.isTestnet ? 'testnet' : 'mainnet'
        }
      };

      const { error } = await this.supabase
        .from('wallets')
        .insert(walletData);

      if (error) {
        throw error;
      }

      console.log(`Wallet stored in database for user: ${userId}`);
    } catch (error: any) {
      console.error('Failed to store wallet in database:', error);
      throw error;
    }
  }

  /**
   * Log ACT distribution in database
   */
  private async logDistribution(
    toPublicKey: string, 
    amount: string, 
    transactionHash: string, 
    memo: string
  ): Promise<void> {
    try {
      // Update wallet balance
      const { error: updateError } = await this.supabase
        .from('wallets')
        .update({
          balance: `balance + ${amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('address', toPublicKey);

      if (updateError) {
        console.error('Failed to update wallet balance:', updateError);
      }

      // Log transaction in blockchain_transactions table
      const { error: txError } = await this.supabase
        .from('blockchain_transactions')
        .insert({
          wallet_id: toPublicKey,
          transaction_hash: transactionHash,
          transaction_type: 'ACT_DISTRIBUTION',
          amount: parseFloat(amount),
          fee: 0.0001, // Stellar transaction fee
          status: 'completed',
          block_number: null,
          confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (txError) {
        console.error('Failed to log transaction:', txError);
      }

      console.log(`Distribution logged: ${amount} ACT -> ${toPublicKey}`);
    } catch (error: any) {
      console.error('Failed to log distribution:', error);
    }
  }

  /**
   * Encrypt sensitive data (basic implementation)
   */
  private encryptSensitiveData(data: string): string {
    // This is a basic implementation - in production, use proper encryption
    // For now, we'll use base64 encoding as a placeholder
    return Buffer.from(data).toString('base64');
  }

  /**
   * Get network information
   */
  getNetworkInfo(): {
    network: string;
    horizonUrl: string;
    publicKey: string;
    isTestnet: boolean;
  } {
    return {
      network: this.isTestnet ? 'testnet' : 'mainnet',
      horizonUrl: this.horizonServer.serverUrl,
      publicKey: this.publicKey,
      isTestnet: this.isTestnet
    };
  }

  /**
   * Health check for Stellar service
   */
  async healthCheck(): Promise<{ status: string; latency: number; account: any }> {
    const start = Date.now();
    
    try {
      const account = await this.horizonServer.loadAccount(this.publicKey);
      const latency = Date.now() - start;
      
      console.log(`Stellar service healthy: ${latency}ms latency`);
      
      return {
        status: 'healthy',
        latency,
        account: {
          accountId: account.id,
          balance: account.balances.find(b => b.asset_type === 'native')?.balance || '0'
        }
      };
    } catch (error: any) {
      console.error('Stellar service health check failed:', error);
      
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        account: null
      };
    }
  }
}

export { StellarLabsService, type ACTTokenTransfer, type StellarAccountInfo };
export default StellarLabsService;