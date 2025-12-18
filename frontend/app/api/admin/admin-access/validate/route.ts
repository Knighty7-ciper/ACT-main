import { NextRequest, NextResponse } from 'next/server';

/**
 * Validate Admin Access Answer
 * No authentication required - this is the secret entry point
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answer } = body;

    if (!answer) {
      return NextResponse.json(
        { error: 'Answer is required' },
        { status: 400 }
      );
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${BACKEND_URL}/api/admin/admin-access/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to validate admin access' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error validating admin access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}