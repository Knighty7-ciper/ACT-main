import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

/**
 * Admin Compliance Reports API
 * Proxies compliance reports to backend compliance service
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
    const type = searchParams.get('type') || ''
    const search = searchParams.get('search') || ''

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && { search })
    })

    // Proxy request to backend compliance service
    const response = await fetch(`${BACKEND_URL}/compliance/reports?${queryParams}`, {
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
          error: errorData.message || 'Failed to fetch compliance reports' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: {
        reports: data.data || data.reports || [],
        pagination: data.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.total || 0
        }
      }
    })
  } catch (error) {
    console.error('Compliance reports proxy error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const type = searchParams.get('type') || 'monthly'

    // Get request body
    const body = await request.json()

    // Determine the endpoint based on type
    let endpoint = ''
    switch (type) {
      case 'sar':
        endpoint = '/compliance/reports/sar'
        break
      case 'ctr':
        endpoint = '/compliance/reports/ctr'
        break
      default:
        endpoint = '/compliance/reports/monthly'
    }

    // Proxy request to backend compliance service
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Failed to create compliance report' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data.data || data
    })
  } catch (error) {
    console.error('Create compliance report error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}