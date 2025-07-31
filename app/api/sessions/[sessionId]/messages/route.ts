import { NextRequest, NextResponse } from 'next/server'

const ZEP_API_BASE = process.env.ZEP_API_BASE || "https://api.getzep.com/api/v2"
const ZEP_API_KEY = process.env.ZEP_API_KEY 

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${ZEP_API_BASE}/sessions/${sessionId}/messages`, {
      headers: {
        'Authorization': `Api-Key ${ZEP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Session not found, return empty messages
        return NextResponse.json({
          messages: [],
          total_count: 0,
          row_count: 0
        })
      }
      
      throw new Error(`Zep API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching session messages:', error)
    
    // Return empty messages instead of error to prevent app crashes
    return NextResponse.json({
      messages: [],
      total_count: 0,
      row_count: 0
    })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${ZEP_API_BASE}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${ZEP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Zep API error: ${response.status} ${response.statusText}`, errorText)
      
      return NextResponse.json(
        { error: `Failed to add message: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error adding message to session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
