const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') || '20'

    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queryParams = new URLSearchParams()
    if (userId) queryParams.append('userId', userId)
    queryParams.append('limit', limit)

    const response = await fetch(`${BACKEND_URL}/transactions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    })

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return Response.json([], { status: 200 }) // Return empty array on error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return Response.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}