// Admin API Service for User-side Request Management
class AdminAPIService {
  constructor(baseURL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin` : '/api/admin') {
    this.baseURL = baseURL;
  }

  async makeRequest(endpoint, options = {}, userToken) {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User Request Management
  async createUserRequest(requestData, userToken) {
    const response = await this.makeRequest('/requests', {
      method: 'POST',
      body: JSON.stringify({
        ...requestData,
        priority: requestData.priority || 'medium'
      })
    }, userToken);

    return {
      success: true,
      data: response.request_id,
      message: 'Request created successfully'
    };
  }

  async getUserRequests(userToken, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.status && options.status !== 'all') {
      queryParams.append('status', options.status);
    }
    
    if (options.limit) {
      queryParams.append('limit', options.limit);
    }
    
    if (options.offset) {
      queryParams.append('offset', options.offset);
    }
    
    if (options.sort) {
      queryParams.append('sort', options.sort);
    }

    const endpoint = `/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return await this.makeRequest(endpoint, {
      method: 'GET'
    }, userToken);
  }

  async getUserRequestDetails(requestId, userToken) {
    const response = await this.makeRequest(`/requests/${requestId}/details`, {
      method: 'GET'
    }, userToken);

    return response;
  }

  async cancelUserRequest(requestId, userToken) {
    return await this.makeRequest(`/requests/${requestId}/cancel`, {
      method: 'PUT'
    }, userToken);
  }

  // Authorization Management
  async getUserAuthorizationDetails(requestId, userToken) {
    try {
      const response = await this.makeRequest(`/authorizations/user/${requestId}`, {
        method: 'GET'
      }, userToken);
      return response;
    } catch (error) {
      // Return null if no authorization details found
      return { data: null };
    }
  }

  async resendAuthorizationEmail(token, userToken) {
    return await this.makeRequest(`/authorization/resend`, {
      method: 'POST',
      body: JSON.stringify({ token })
    }, userToken);
  }

  // User Dashboard Data
  async getUserDashboardData(userToken) {
    return await this.makeRequest('/user/dashboard', {
      method: 'GET'
    }, userToken);
  }

  // Contact Support (alternative to admin requests)
  async submitContactSupport(messageData, userToken) {
    return await this.makeRequest('/contact-support', {
      method: 'POST',
      body: JSON.stringify(messageData)
    }, userToken);
  }

  // Check Authorization Status
  async checkAuthorizationStatus(token, userToken) {
    return await this.makeRequest(`/authorization/status/${token}`, {
      method: 'GET'
    }, userToken);
  }

  // Get User's Recent Activity
  async getUserActivity(userToken, limit = 10) {
    return await this.makeRequest(`/user/activity?limit=${limit}`, {
      method: 'GET'
    }, userToken);
  }

  // Validate Authorization Token (for users)
  async validateAuthorizationToken(token) {
    const response = await this.makeRequest('/verify-authorization', {
      method: 'POST',
      body: JSON.stringify({ token })
    }, null); // No user token needed for public authorization verification

    return response;
  }

  // Get Authorization Details by Token (for verification page)
  async getAuthorizationByToken(token) {
    const response = await this.makeRequest(`/authorization-details?token=${token}`, {
      method: 'GET'
    }, null); // No user token needed for public authorization lookup

    return response;
  }

  // Request Statistics for User
  async getUserRequestStats(userToken) {
    return await this.makeRequest('/requests/stats', {
      method: 'GET'
    }, userToken);
  }

  // Submit Feedback on Completed Requests
  async submitRequestFeedback(requestId, rating, feedback, userToken) {
    return await this.makeRequest(`/requests/${requestId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    }, userToken);
  }

  // Get Request History with Filters
  async getRequestHistory(userToken, filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    return await this.makeRequest(`/requests/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      method: 'GET'
    }, userToken);
  }

  // Pre-fill Request Types
  static getRequestTypes() {
    return {
      profile_edit: {
        label: 'Profile Information Update',
        icon: '👤',
        description: 'Update personal information like name, phone, address, etc.',
        fields: ['full_name', 'phone', 'date_of_birth', 'country_code', 'city']
      },
      kyc_assistance: {
        label: 'KYC Document Issues',
        icon: '📄',
        description: 'Help with identity verification and document submission',
        fields: ['document_type', 'issue_description']
      },
      transaction_review: {
        label: 'Transaction Questions',
        icon: '💳',
        description: 'Questions about payments, tokens, or transaction history',
        fields: ['transaction_id', 'issue_type', 'transaction_date']
      },
      account_issue: {
        label: 'Account Access Issues',
        icon: '🔒',
        description: 'Login problems, account locked, or access issues',
        fields: ['issue_category', 'last_successful_login']
      },
      data_export: {
        label: 'Data Export Request',
        icon: '📊',
        description: 'Request a copy of your account data',
        fields: ['data_types', 'export_format']
      },
      other: {
        label: 'Other Assistance',
        icon: '❓',
        description: 'Any other type of assistance you need',
        fields: []
      }
    };
  }

  // Get Priority Levels
  static getPriorityLevels() {
    return {
      low: {
        label: 'Low Priority',
        description: 'General inquiry or non-urgent request',
        color: 'green',
        expectedResponse: '5-7 days'
      },
      medium: {
        label: 'Medium Priority',
        description: 'Standard request that needs attention',
        color: 'yellow',
        expectedResponse: '2-3 days'
      },
      high: {
        label: 'High Priority',
        description: 'Important request that needs quick attention',
        color: 'orange',
        expectedResponse: '24 hours'
      },
      urgent: {
        label: 'Urgent',
        description: 'Critical issue that needs immediate attention',
        color: 'red',
        expectedResponse: '2-4 hours'
      }
    };
  }

  // Format Request Data for Display
  static formatRequestForDisplay(request) {
    const requestTypes = AdminAPIService.getRequestTypes();
    const priorityLevels = AdminAPIService.getPriorityLevels();
    
    return {
      ...request,
      request_type_label: requestTypes[request.request_type]?.label || request.request_type,
      request_type_icon: requestTypes[request.request_type]?.icon || '❓',
      priority_label: priorityLevels[request.priority]?.label || request.priority,
      priority_color: priorityLevels[request.priority]?.color || 'gray',
      formatted_date: new Date(request.requested_at).toLocaleDateString(),
      formatted_time: new Date(request.requested_at).toLocaleTimeString(),
      time_ago: AdminAPIService.getTimeAgo(request.requested_at)
    };
  }

  // Get Time Ago String
  static getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Generate Request Summary
  static generateRequestSummary(requests) {
    if (!requests || requests.length === 0) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0,
        urgent_count: 0
      };
    }

    return requests.reduce((summary, request) => {
      summary.total++;
      summary[request.status] = (summary[request.status] || 0) + 1;
      
      if (request.priority === 'urgent') {
        summary.urgent_count++;
      }
      
      return summary;
    }, {
      total: 0,
      pending: 0,
      approved: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      urgent_count: 0
    });
  }
}

export const adminAPI = new AdminAPIService();