export interface Transaction {
  id: string
  userId: string
  fromWalletId?: string
  toWalletId?: string
  amount: number
  currencyCode: string
  transactionType: string
  status: string
  description?: string
  reference?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionRequest {
  fromWalletId?: string
  toWalletId?: string
  amount: number
  currencyCode: string
  transactionType: string
  description?: string
  reference?: string
}

export interface SendMoneyRequest {
  fromWalletId: string
  toAddress: string
  amount: number
  currencyCode: string
  description?: string
}

export interface TransactionHistory {
  transactions: Transaction[]
  totalSent: number
  totalReceived: number
  totalCount: number
}

export class TransactionService {
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

  async getTransactionHistory(userId?: string, limit = 20): Promise<TransactionHistory> {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      params.append('limit', limit.toString())

      const response = await fetch(`/api/transactions?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Calculate totals
      const transactions = result || []
      const sent = transactions.filter((t: Transaction) => t.transactionType === 'send')
      const received = transactions.filter((t: Transaction) => t.transactionType === 'receive')
      
      const totalSent = sent.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      const totalReceived = received.reduce((sum: number, t: Transaction) => sum + t.amount, 0)

      return {
        transactions,
        totalSent,
        totalReceived,
        totalCount: transactions.length
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      
      // Return empty result as fallback
      return {
        transactions: [],
        totalSent: 0,
        totalReceived: 0,
        totalCount: 0
      }
    }
  }

  async getTransactionsByWalletId(walletId: string): Promise<{ data: Transaction[] | null, error: any }> {
    try {
      const response = await fetch(`/api/transactions/wallet/${walletId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet transactions: ${response.statusText}`)
      }

      const result = await response.json()
      return { data: result, error: null }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error)
      return { data: null, error }
    }
  }

  async getTransactionById(transactionId: string): Promise<{ data: Transaction | null, error: any }> {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`)
      }

      const result = await response.json()
      return { data: result, error: null }
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return { data: null, error }
    }
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create transaction: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  async sendMoney(sendData: SendMoneyRequest): Promise<Transaction> {
    try {
      const response = await fetch('/api/transactions/send', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(sendData),
      })

      if (!response.ok) {
        throw new Error(`Failed to send money: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error sending money:', error)
      throw error
    }
  }

  // Legacy Supabase methods for backward compatibility
  async getAllTransactions(): Promise<{ data: Transaction[] | null, error: any }> {
    try {
      const history = await this.getTransactionHistory()
      return { data: history.transactions, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Utility methods
  filterTransactionsByType(transactions: Transaction[], type: string): Transaction[] {
    return transactions.filter(t => t.transactionType === type)
  }

  filterTransactionsByStatus(transactions: Transaction[], status: string): Transaction[] {
    return transactions.filter(t => t.status === status)
  }

  calculateTotalAmount(transactions: Transaction[]): number {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }

  getTransactionsByDateRange(transactions: Transaction[], startDate: Date, endDate: Date): Transaction[] {
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  formatTransactionAmount(amount: number, currencyCode: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })
    
    return `${formatter.format(amount)} ${currencyCode}`
  }

  getTransactionIcon(type: string) {
    switch (type.toLowerCase()) {
      case 'send':
      case 'transfer_out':
        return '↑'
      case 'receive':
      case 'transfer_in':
        return '↓'
      case 'exchange':
        return '⇄'
      default:
        return '○'
    }
  }

  getTransactionColor(type: string) {
    switch (type.toLowerCase()) {
      case 'send':
      case 'transfer_out':
        return 'text-red-600'
      case 'receive':
      case 'transfer_in':
        return 'text-green-600'
      case 'exchange':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }
}

export const transactionService = new TransactionService()
