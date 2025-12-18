// API-specific types for external services

export interface ExchangeRateApiResponse {
  base: string
  rates: Record<string, number>
  timestamp: number
}

export interface GoldPriceApiResponse {
  price: number
  currency: string
  timestamp: number
}

export interface EmailServicePayload {
  to: string
  subject: string
  html: string
  from?: string
}

export interface SmsServicePayload {
  to: string
  message: string
  from?: string
}

export interface KycVerificationPayload {
  userId: string
  documentType: string
  documentUrl: string
}

export interface PaymentGatewayPayload {
  amount: number
  currency: string
  email: string
  reference: string
  callbackUrl: string
}
