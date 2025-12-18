"use client"

import { useState, useEffect } from 'react'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name?: string
  kyc_status: 'pending' | 'verified' | 'rejected'
  is_active: boolean
  last_login?: string
  country?: string
  created_at: string
}

export default function AdminUsers() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        search: searchTerm,
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Transform the data to match the expected interface
        const transformedUsers = result.data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          kyc_status: user.is_email_verified ? 'verified' : 'pending',
          is_active: user.is_active,
          last_login: user.last_login_at,
          country: user.countries?.name || user.country_code,
          created_at: user.created_at,
        }))
        setUsers(transformedUsers)
      } else {
        throw new Error(result.error || 'Failed to load users')
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      setUsers([]) // Clear users on error
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAutoAdmin) {
    return (
      <div className="min-h-screen bg-binance-black">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">Administrator privileges required.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={true} user={{ email: adminUser?.email || '', isAdmin: true }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Users className="h-8 w-8 mr-3 text-blue-400" />
                User Management
                <Crown className="h-5 w-5 ml-2 text-yellow-400" />
              </h1>
              <p className="text-gray-300 mt-2">Complete user management with god-mode access</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">KYC Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium">
                            {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-gray-400 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.kyc_status === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : user.kyc_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.kyc_status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {user.kyc_status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {user.kyc_status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {user.kyc_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {user.country || 'Not specified'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">User Details - God Mode Access</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <input
                        type="text"
                        defaultValue={selectedUser.full_name || ''}
                        className="w-full bg-transparent text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-gray-300">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">KYC Status</label>
                    <select 
                      defaultValue={selectedUser.kyc_status}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select 
                      defaultValue={selectedUser.is_active ? 'active' : 'inactive'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                {/* God-Mode Actions section removed for security - requires proper backend implementation */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
