import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pppData } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'value'
    const countryCode = searchParams.get('country')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (action === 'value' && countryCode) {
      // Get PPP value for a specific country
      const data = await db
        .select()
        .from(pppData)
        .where(eq(pppData.country, countryCode.toUpperCase()))
        .orderBy(desc(pppData.createdAt))
        .limit(1)

      if (!data.length) {
        return NextResponse.json(
          {
            success: false,
            error: 'No data',
            message: 'No PPP value available for this country',
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data[0],
      })
    }

    if (action === 'global') {
      // Get global PPP comparison
      const allData = await db
        .select()
        .from(pppData)
        .orderBy(desc(pppData.createdAt))
        .limit(limit)

      return NextResponse.json({
        success: true,
        data: allData,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
        message: `Action '${action}' is not supported`,
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('PPP API error:', error)
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
