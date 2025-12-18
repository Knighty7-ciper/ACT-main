// Re-export all types from database
export * from "./database"

// Additional application types
export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  country: string
  exchange_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NewsArticle {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  image_url?: string
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  user_id: string
  full_name: string
  email: string
  phone_number?: string
  country?: string
  kyc_status: "pending" | "verified" | "rejected" | "not_submitted"
  role: "user" | "admin" | "super_admin"
  created_at: string
  updated_at: string
}

export interface Reserve {
  id: string
  currency_code: string
  amount: number
  reserve_type: "gold" | "fiat" | "crypto"
  created_at: string
  updated_at: string
}

export interface BasketComposition {
  id: string
  currency_code: string
  weight_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SystemSettings {
  id: string
  setting_key: string
  setting_value: string
  description?: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  fullName: string
  confirmPassword: string
}

export interface SendTransactionFormData {
  recipientPublicKey: string
  amount: number
  memo?: string
}

export interface ExchangeFormData {
  fromCurrency: string
  toCurrency: string
  amount: number
}

// Chart data types
export interface ChartDataPoint {
  label: string
  value: number
}

export interface TimeSeriesData {
  timestamp: string
  value: number
}
