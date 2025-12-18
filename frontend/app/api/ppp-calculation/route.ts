import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

// Calculate ACT value using PPP
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/ppp-calculation/calculate-act`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get latest ACT value
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/ppp-calculation/latest-act`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}