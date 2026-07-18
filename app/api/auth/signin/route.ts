import { NextRequest, NextResponse } from 'next/server'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db')

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (!foundUser.length) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      )
    }

    const userData = foundUser[0]

    return NextResponse.json(
      {
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Signin failed',
      },
      { status: 500 }
    )
  }
}
