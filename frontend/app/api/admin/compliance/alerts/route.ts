import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

/**
 * Admin Compliance Alerts API
 * Proxies compliance alerts to backend compliance service
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
    const severity = searchParams.get('severity') || ''
    const type = searchParams.get('type') || ''
    const search = searchParams.get('search') || ''

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(severity && { severity }),
      ...(type && { type }),
      ...(search && { search })
    })

    // Proxy request to backend compliance service
    const response = await fetch(`${BACKEND_URL}/compliance/alerts?${queryParams}`, {
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
          error: errorData.message || 'Failed to fetch compliance alerts' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: {
        alerts: data.data || data.alerts || [],
        pagination: data.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.total || 0
        }
      }
    })
  } catch (error) {
    console.error('Compliance alerts proxy error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.json()

    // Proxy request to backend compliance service
    const response = await fetch(`${BACKEND_URL}/compliance/alerts/${alertId}/status`, {
      method: 'PUT',
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
          error: errorData.message || 'Failed to update compliance alert' 
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
    console.error('Update compliance alert error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}