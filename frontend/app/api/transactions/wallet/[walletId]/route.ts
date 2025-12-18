const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function GET(
  request: Request,
  { params }: { params: { walletId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/transactions/wallet/${params.walletId}`, {
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
    console.error('Error fetching wallet transactions:', error)
    return Response.json([], { status: 200 })
  }
}