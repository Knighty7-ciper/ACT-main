import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

/**
 * Admin WAF Rules API
 * Proxies WAF rules to backend security service
 * Requires admin authentication
 */

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    const status = searchParams.get('status') || ''
    const action = searchParams.get('action') || ''
    const search = searchParams.get('search') || ''

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(action && { action }),
      ...(search && { search })
    })

    // Proxy request to backend security service
    const response = await fetch(`${BACKEND_URL}/security/waf/rules?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Failed to fetch WAF rules' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: {
        rules: data.data || data.rules || [],
        pagination: data.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.total || 0
        }
      }
    })
  } catch (error) {
    console.error('WAF rules proxy error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}