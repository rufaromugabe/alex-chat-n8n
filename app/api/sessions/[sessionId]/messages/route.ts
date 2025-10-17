import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain') || 'general'

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch messages from domain-specific chats table (e.g., zesa.chats, general.chats)
    const query = `
      SELECT id, session_id, message 
      FROM ${domain}.chats 
      WHERE session_id = $1 
      ORDER BY id ASC
    `

    console.log(`Querying ${domain}.chats for session ${sessionId}`)
    const result = await pool.query(query, [sessionId])
    const dbMessages = result.rows
    console.log(`Found ${dbMessages.length} messages for session ${sessionId}`)

    // Convert database messages to app format
    const messages = dbMessages.map(dbMsg => {
      console.log('Processing message:', JSON.stringify(dbMsg.message))

      const messageType = dbMsg.message.type || 'unknown'
      const isUserMessage = messageType === 'human' || messageType === 'user'

      return {
        id: dbMsg.id.toString(),
        uuid: dbMsg.id.toString(),
        created_at: new Date().toISOString(),
        role: isUserMessage ? 'user' : 'assistant',
        role_type: isUserMessage ? 'user' as const : 'assistant' as const,
        content: dbMsg.message.content,
        token_count: 0,
        processed: true
      }
    })

    console.log('Returning messages:', messages.length)

    return NextResponse.json({
      messages,
      total_count: messages.length,
      row_count: messages.length
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({
      messages: [],
      total_count: 0,
      row_count: 0
    })
  }
}

// POST functionality has been removed - messages are auto-saved by the webhook
