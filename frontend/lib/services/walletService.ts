import { api } from './api'

export interface Wallet {
  id: string
  userId: string
  address: string
  currencyCode: string
  balance: number
  isActive: boolean
  walletType: string
  isVerified: boolean
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWalletRequest {
  currencyCode: string
  address: string
  walletType?: string
}

export interface UpdateWalletRequest {
  address?: string
  isActive?: boolean
  isVerified?: boolean
}

export class WalletService {
  private token: string | null = null

  setAuthToken(token: string) {
    this.token = token
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  async createWallet(walletData: CreateWalletRequest): Promise<Wallet> {
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(walletData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }

  async getUserWallets(): Promise<Wallet[]> {
    try {
      const response = await fetch('/api/wallet', {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch wallets: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching wallets:', error)
      // Return empty array as fallback
      return []
    }
  }

  async getWalletById(walletId: string): Promise<Wallet> {
    try {
      const response = await fetch(`/api/wallet/${walletId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching wallet:', error)
      throw error
    }
  }

  async updateWallet(walletId: string, updateData: UpdateWalletRequest): Promise<Wallet> {
    try {
      const response = await fetch(`/api/wallet/${walletId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update wallet: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating wallet:', error)
      throw error
    }
  }

  async verifyWallet(walletId: string): Promise<Wallet> {
    try {
      const response = await fetch(`/api/wallet/${walletId}/verify`, {
        method: 'PUT',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to verify wallet: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error verifying wallet:', error)
      throw error
    }
  }

  async deleteWallet(walletId: string): Promise<void> {
    try {
      const response = await fetch(`/api/wallet/${walletId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete wallet: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting wallet:', error)
      throw error
    }
  }

  async updateWalletBalance(walletId: string, amount: number): Promise<void> {
    try {
      const response = await fetch(`/api/wallet/${walletId}/balance`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update wallet balance: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error updating wallet balance:', error)
      throw error
    }
  }

  // Legacy Supabase methods for backward compatibility
  async getWalletsByUserId(userId: string) {
    try {
      const wallets = await this.getUserWallets()
      return { data: wallets, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getWalletByPublicKey(publicKey: string) {
    try {
      const wallets = await this.getUserWallets()
      const wallet = wallets.find(w => w.address === publicKey)
      return { data: wallet, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Utility methods
  getWalletsByCurrency(wallets: Wallet[], currencyCode: string): Wallet[] {
    return wallets.filter(wallet => wallet.currencyCode === currencyCode)
  }

  getActiveWallets(wallets: Wallet[]): Wallet[] {
    return wallets.filter(wallet => wallet.isActive)
  }

  getVerifiedWallets(wallets: Wallet[]): Wallet[] {
    return wallets.filter(wallet => wallet.isVerified)
  }

  calculateTotalBalance(wallets: Wallet[]): number {
    return wallets.reduce((total, wallet) => total + wallet.balance, 0)
  }

  formatBalance(balance: number, currencyCode: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })
    
    return `${formatter.format(balance)} ${currencyCode}`
  }

  async createDefaultWallets(): Promise<Wallet[]> {
    const defaultCurrencies = ['NGN', 'KES', 'ZAR', 'GHS', 'USD', 'EUR', 'ACT']
    const createdWallets: Wallet[] = []

    for (const currency of defaultCurrencies) {
      try {
        const wallet = await this.createWallet({
          currencyCode: currency,
          address: `${currency}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          walletType: 'traditional'
        })
        createdWallets.push(wallet)
      } catch (error) {
        console.warn(`Failed to create wallet for ${currency}:`, error)
      }
    }

    return createdWallets
  }
}

export const walletService = new WalletService()
