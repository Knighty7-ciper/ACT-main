import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Server, Keypair, TransactionBuilder, Operation, Asset, Networks, BASE_FEE } from '@stellar/stellar-sdk';
import { getStellarConfig, getStellarKeypair } from '../config/stellar.config';

@Injectable()
export class StellarWalletService {
  private readonly logger = new Logger(StellarWalletService.name);
  private readonly config = getStellarConfig();
  private readonly server = new Server(this.config.horizonUrl);

  async createWallet(): Promise<{ publicKey: string; secret: string }> {
    try {
      const keypair = Keypair.random();
      this.logger.log('New Stellar wallet created');
      return {
        publicKey: keypair.publicKey(),
        secret: keypair.secret(),
      };
    } catch (error) {
      this.logger.error('Failed to create Stellar wallet', error);
      throw new BadRequestException('Failed to create wallet');
    }
  }

  async getAccountBalance(publicKey: string): Promise<any> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account.balances;
    } catch (error) {
      this.logger.error(`Failed to get balance for ${publicKey}`, error);
      throw new BadRequestException('Failed to get account balance');
    }
  }

  async transferXLM(
    fromSecret: string,
    toPublicKey: string,
    amount: string,
  ): Promise<string> {
    try {
      const sourceKeypair = Keypair.fromSecret(fromSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      const sourceAccount = await this.server.loadAccount(sourcePublicKey);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.config.networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: toPublicKey,
            asset: Asset.native(),
            amount: amount,
          }),
        )
        .setNetworkPassphrase(this.config.networkPassphrase)
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);

      const result = await this.server.submitTransaction(transaction);
      this.logger.log(`Transfer successful: ${result.id}`);
      return result.id;
    } catch (error) {
      this.logger.error('Transfer failed', error);
      throw new BadRequestException('Transfer failed');
    }
  }


  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (this.config.network !== 'testnet') {
      throw new BadRequestException('Funding only available on testnet');
    }

    try {
      await this.server.friendbot(publicKey).call();
      this.logger.log(`Testnet account ${publicKey} funded`);
      return true;
    } catch (error) {
      this.logger.error('Friendbot funding failed', error);
      return false;
    }
  }
}
