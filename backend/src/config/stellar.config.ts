import { Keypair, Networks } from '@stellar/stellar-base';

export interface StellarConfig {
  network: 'testnet' | 'public';
  horizonUrl: string;
  signingKey: string;
  publicKey: string;
  networkPassphrase: string;
}

export const getStellarConfig = (): StellarConfig => {
  const network = (process.env.STELLAR_NETWORK || 'testnet') as 'testnet' | 'public';
  const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const signingKey = process.env.STELLAR_SIGNING_KEY;
  const publicKey = process.env.STELLAR_PUBLIC_KEY;

  if (!signingKey || !publicKey) {
    throw new Error('Stellar signing key and public key must be configured');
  }

  return {
    network,
    horizonUrl,
    signingKey,
    publicKey,
    networkPassphrase:
      network === 'public'
        ? Networks.PUBLIC
        : Networks.TESTNET,
  };
};

export const getStellarKeypair = (): Keypair => {
  const signingKey = process.env.STELLAR_SIGNING_KEY;
  if (!signingKey) {
    throw new Error('STELLAR_SIGNING_KEY environment variable is not set');
  }
  return Keypair.fromSecret(signingKey);
};
