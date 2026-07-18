import { NextRequest, NextResponse } from 'next/server'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { v4: uuidv4 } = await import('uuid')

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await db
      .insert(user)
      .values({
        id: uuidv4(),
        email,
        name: name || null,
        emailVerified: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Signup failed',
      },
      { status: 500 }
    )
  }
}
