// Stellar-specific types
export interface StellarAccount {
  publicKey: string
  secretKey?: string
  balance: number
}

export interface StellarTransaction {
  hash: string
  source: string
  destination: string
  amount: string
  memo?: string
  createdAt: string
  status: "pending" | "success" | "failed"
}

export interface TrustlineAsset {
  code: string
  issuer: string
  balance: string
  limit: string
}

export interface StellarPayment {
  from: string
  to: string
  amount: string
  asset: {
    code: string
    issuer: string
  }
  memo?: string
}
