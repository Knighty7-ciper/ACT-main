export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  profileImage?: string
  bio?: string
  role: string
  isEmailVerified: boolean
  isActive: boolean
  countryCode?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  countryCode?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  profileImage?: string
  bio?: string
  countryCode?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export class UserService {
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

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create user: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async getUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    try {
      const response = await fetch(`/api/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  async deactivateUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`/api/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to deactivate user: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw error
    }
  }

  async activateUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`/api/users/${userId}/activate`, {
        method: 'PUT',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to activate user: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error activating user:', error)
      throw error
    }
  }

  // Legacy Supabase methods for backward compatibility
  async getProfile(userId: string) {
    try {
      const user = await this.getUser(userId)
      return { data: user, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateProfile(userId: string, updates: any) {
    try {
      const user = await this.updateUser(userId, updates)
      return { data: user, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getAllUsers() {
    try {
      const result = await this.getAllUsers()
      return { data: result.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Utility methods
  formatFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim()
  }

  getInitials(user: User): string {
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : ''
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : ''
    return `${firstInitial}${lastInitial}`
  }

  isAdmin(user: User): boolean {
    return user.role === 'admin' || user.role === 'super_admin'
  }

  isActive(user: User): boolean {
    return user.isActive === true
  }
}

export const userService = new UserService()
