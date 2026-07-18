import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function GET(request: NextRequest) {
  try {
    // Lazy load db to avoid build-time errors
    const { db } = await import('@/lib/db')
    
    const userId = await getUserId()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      success: true,
      data: userTransactions,
    })
  } catch (error) {
    console.error('Transactions GET error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lazy load db to avoid build-time errors
    const { db } = await import('@/lib/db')
    
    const userId = await getUserId()
    const body = await request.json()

    const {
      fromWalletAddress,
      toWalletAddress,
      amount,
      transactionType,
      description,
      status = 'pending',
    } = body

    if (!fromWalletAddress || !toWalletAddress || !amount || !transactionType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message:
            'fromWalletAddress, toWalletAddress, amount, and transactionType are required',
        },
        { status: 400 }
      )
    }

    const newTransaction = await db
      .insert(transactions)
      .values({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        fromWalletAddress,
        toWalletAddress,
        amount: amount.toString(),
        transactionType,
        status,
        description: description || null,
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction created successfully',
        data: newTransaction[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Transactions POST error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
