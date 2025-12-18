export const CURRENCIES = {
  ACT: "ACT",
  NGN: "NGN",
  GHS: "GHS",
  KES: "KES",
  ZAR: "ZAR",
  EGP: "EGP",
  MAD: "MAD",
  DZD: "DZD",
  TND: "TND",
  ETB: "ETB",
  TZS: "TZS",
  UGX: "UGX",
  RWF: "RWF",
  ZMW: "ZMW",
} as const

export const TRANSACTION_TYPES = {
  SEND: "send",
  RECEIVE: "receive",
  EXCHANGE: "exchange",
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
} as const

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const

export const KYC_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  NOT_SUBMITTED: "not_submitted",
} as const

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const

export const STELLAR_NETWORK = {
  TESTNET: "testnet",
  MAINNET: "mainnet",
} as const

export const API_ENDPOINTS = {
  EXCHANGE_RATES: "/api/exchange-rates",
  GOLD_PRICES: "/api/gold-prices",
  TRANSACTIONS: "/api/transactions",
  WALLETS: "/api/wallets",
  USERS: "/api/users",
  KYC: "/api/kyc",
} as const

export const LIMITS = {
  MAX_TRANSACTION_AMOUNT: 1000000,
  MIN_TRANSACTION_AMOUNT: 0.01,
  MAX_MEMO_LENGTH: 28,
  TRANSACTIONS_PER_PAGE: 50,
} as const
