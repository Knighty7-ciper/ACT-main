// Component prop types

export interface NavBarProps {
  user?: {
    email: string
    isAdmin: boolean
  }
}

export interface FooterProps {
  className?: string
}

export interface WalletCardProps {
  balance: number
  publicKey: string
}

export interface TransactionListProps {
  transactions: any[]
  userWalletId: string
}

export interface CurrencyCardProps {
  code: string
  name: string
  symbol: string
  rate: number
  change24h?: number
  flag?: string
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export interface ChartProps {
  type: "line" | "bar" | "pie"
  data: any
  options?: any
  className?: string
  height?: number
}
