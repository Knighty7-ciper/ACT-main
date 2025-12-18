import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { Server as HorizonServer } from 'stellar-sdk/lib/horizon';
import { 
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Networks,
  Memo,
} from '@stellar/stellar-base';

const app: express.Application = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Stellar Configuration
const stellarConfig = {
  network: 'testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  signingKey: process.env.STELLAR_SIGNING_KEY || 'SDXPBSW5X4E3DM5TQY2G25YWZ2KRVCJYWWJWSYKOEG5RXGUEN2USTAD6',
  publicKey: process.env.STELLAR_PUBLIC_KEY || 'GB5KYJFG3GD3LXDLMGYZWDJATRDYSRWVJ4TMTAKIF7AZ3ZX5ZL7PVPH6',
  networkPassphrase: Networks.TESTNET,
};

const server = new HorizonServer(stellarConfig.horizonUrl);
const ACT_ASSET = new Asset('ACT', stellarConfig.publicKey);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ACT Stellar Server'
  });
});

// Get network status
app.get('/act-stellar/network-status', async (req, res) => {
  try {
    const feeStats = await server.feeStats();
    const latestLedger = await server.ledgers().order('desc').limit(1).call();
    
    res.json({
      success: true,
      data: {
        network: 'Stellar Testnet',
        horizonUrl: stellarConfig.horizonUrl,
        networkPassphrase: stellarConfig.networkPassphrase,
        latestLedger: latestLedger.records[0]?.sequence || 'Unknown',
        feeStats: {
          last_ledger_base_fee: feeStats.last_ledger_base_fee,
          ledger_capacity_usage: feeStats.ledger_capacity_usage,
          max_fee: feeStats.max_fee
        },
        status: 'operational'
      }
    });
  } catch (error) {
    console.error('Network status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create wallet with ACT trustline
app.post('/act-stellar/wallet/create', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const keypair = Keypair.random();
    
    // Fund with testnet XLM using Friendbot
    const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
    try {
      await fetch(friendbotUrl);
      console.log(`Account funded: ${keypair.publicKey()}`);
    } catch (fundingError) {
      console.warn(`Funding failed for ${keypair.publicKey()}:`, fundingError);
    }
    
    // Establish ACT trustline
    const account = await server.loadAccount(keypair.publicKey());
    const trustlineTxn = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset: ACT_ASSET,
          source: keypair.publicKey(),
        })
      )
      .setTimeout(30)
      .build();
    
    trustlineTxn.sign(keypair);
    await server.submitTransaction(trustlineTxn);
    
    console.log(`ACT wallet created for user ${userId}: ${keypair.publicKey()}`);
    
    res.json({
      success: true,
      data: {
        publicKey: keypair.publicKey(),
        secret: keypair.secret(),
        userId,
        actTrustline: true
      }
    });
  } catch (error) {
    console.error('Wallet creation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get balance
app.get('/act-stellar/balance/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const account = await server.loadAccount(publicKey);
    
    const actBalance = account.balances.find((balance: any) => 
      balance.asset_type === 'credit_alphanum4' && 
      balance.asset_code === 'ACT' &&
      balance.asset_issuer === stellarConfig.publicKey
    );

    const xlmBalance = account.balances.find((balance: any) => 
      balance.asset_type === 'native'
    );

    res.json({
      success: true,
      data: {
        actBalance: actBalance ? actBalance.balance : '0',
        xlmBalance: xlmBalance ? xlmBalance.balance : '0',
        accountStatus: 'active'
      }
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get platform stats
app.get('/act-stellar/stats', async (req, res) => {
  try {
    // Get issuer account stats
    const issuerAccount = await server.loadAccount(stellarConfig.publicKey);
    
    // Find ACT balance on issuer account
    const issuerActBalance = issuerAccount.balances.find((balance: any) => 
      balance.asset_type === 'credit_alphanum4' && 
      balance.asset_code === 'ACT'
    );

    res.json({
      success: true,
      data: {
        network: 'Stellar Testnet',
        issuer: stellarConfig.publicKey,
        actAsset: {
          code: 'ACT',
          issuer: stellarConfig.publicKey
        },
        issuerActBalance: issuerActBalance ? issuerActBalance.balance : '0',
        totalTrustlines: issuerAccount.balances.filter((b: any) => b.asset_type !== 'native').length,
        networkPassphrase: stellarConfig.networkPassphrase
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Transfer ACT
app.post('/act-stellar/transfer', async (req, res) => {
  try {
    const { fromSecret, toPublicKey, amount, memo } = req.body;
    
    if (!fromSecret || !toPublicKey || !amount) {
      return res.status(400).json({
        success: false,
        error: 'fromSecret, toPublicKey, and amount are required'
      });
    }

    const fromKeypair = Keypair.fromSecret(fromSecret);
    const fromPublicKey = fromKeypair.publicKey();
    
    // Load sender account
    const senderAccount = await server.loadAccount(fromPublicKey);

    // Verify ACT trustline exists
    const actTrustline = senderAccount.balances.find((balance: any) => 
      balance.asset_type === 'credit_alphanum4' && 
      balance.asset_code === 'ACT' &&
      balance.asset_issuer === stellarConfig.publicKey
    );

    if (!actTrustline) {
      throw new Error('ACT trustline not found on sender account');
    }

    const transferTxn = new TransactionBuilder(senderAccount, {
      fee: BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: toPublicKey,
          asset: ACT_ASSET,
          amount: amount,
          source: fromPublicKey,
        })
      )
      .addMemo(memo ? Memo.text(memo) : Memo.none())
      .setTimeout(60)
      .build();

    transferTxn.sign(fromKeypair);
    const result = await server.submitTransaction(transferTxn);
    
    console.log(`ACT transfer completed: ${amount} ACT from ${fromPublicKey} to ${toPublicKey}`);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        amount,
        from: fromPublicKey,
        to: toPublicKey
      }
    });
  } catch (error) {
    console.error('ACT transfer error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`ACT Stellar Test Server running on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`  - GET  /health`);
  console.log(`  - GET  /act-stellar/network-status`);
  console.log(`  - POST /act-stellar/wallet/create`);
  console.log(`  - GET  /act-stellar/stats`);
  console.log(`  - GET  /act-stellar/balance/:publicKey`);
  console.log(`  - POST /act-stellar/transfer`);
  console.log('');
  console.log(`Test with:`);
  console.log(`  curl http://localhost:${port}/act-stellar/network-status`);
});

// Also make it importable
export { app, ACT_ASSET, stellarConfig };