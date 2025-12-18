import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

/**
 * Admin Compliance KYC API
 * Proxies KYC verifications to backend compliance service
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
    const riskLevel = searchParams.get('riskLevel') || ''
    const search = searchParams.get('search') || ''

    // Build query parameters for KYC statistics and document data
    const statsParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(riskLevel && { riskLevel }),
      ...(search && { search })
    })

    // Get KYC statistics
    const statsResponse = await fetch(`${BACKEND_URL}/compliance/kyc/statistics?${statsParams}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!statsResponse.ok) {
      const errorData = await statsResponse.json()
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Failed to fetch KYC statistics' 
        },
        { status: statsResponse.status }
      )
    }

    const statsData = await statsResponse.json()
    
    // Also try to get detailed KYC document information if available
    let documentData = []
    try {
      const documentsResponse = await fetch(`${BACKEND_URL}/compliance/kyc/documents?${statsParams}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      })

      if (documentsResponse.ok) {
        const documentsResult = await documentsResponse.json()
        documentData = documentsResult.data || documentsResult.documents || []
      }
    } catch (error) {
      console.warn('Could not fetch detailed KYC documents:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        verifications: documentData.length > 0 ? documentData : (statsData.data?.verifications || []),
        statistics: statsData.data || statsData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: statsData.total || 0
        }
      }
    })
  } catch (error) {
    console.error('Compliance KYC proxy error:', error)
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
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.json()

    // Proxy request to backend compliance service
    const response = await fetch(`${BACKEND_URL}/compliance/kyc/verify/${userId}`, {
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
          error: errorData.message || 'Failed to verify KYC' 
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
    console.error('KYC verification error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}