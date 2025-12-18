import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

/**
 * Admin Compliance Audit Trail API
 * Proxies audit trail to backend compliance service
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
    const action = searchParams.get('action') || ''
    const user = searchParams.get('user') || ''
    const entityType = searchParams.get('entityType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const search = searchParams.get('search') || ''

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(action && { action }),
      ...(user && { user }),
      ...(entityType && { entityType }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(search && { search })
    })

    // Proxy request to backend compliance service
    const response = await fetch(`${BACKEND_URL}/compliance/audit/trail?${queryParams}`, {
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
          error: errorData.message || 'Failed to fetch audit trail' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: {
        auditTrail: data.data || data.auditTrail || [],
        pagination: data.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.total || 0
        }
      }
    })
  } catch (error) {
    console.error('Compliance audit trail proxy error:', error)
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

    // Get request body
    const body = await request.json()

    // Proxy request to backend compliance service for audit export
    const response = await fetch(`${BACKEND_URL}/compliance/audit/export`, {
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
          error: errorData.message || 'Failed to export audit trail' 
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
    console.error('Export audit trail error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}