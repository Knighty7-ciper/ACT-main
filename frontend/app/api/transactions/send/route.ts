const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/transactions/send`, {
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
    console.error('Error sending money:', error)
    return Response.json({ error: 'Failed to send money' }, { status: 500 })
  }
}