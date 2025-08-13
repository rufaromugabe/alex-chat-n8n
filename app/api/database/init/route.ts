import { NextRequest, NextResponse } from 'next/server'
import DatabaseManager from '@/lib/database'
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
    const domain = searchParams.get('domain') || 'default'

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Determine the table name based on domain
    let tableName = 'general_chat_histories' // default table
    
    if (domain === 'zesa') {
      tableName = 'zesa_chat_histories'
    } else if (domain === 'praz') {
      tableName = 'praz_chat_histories'
    }
    
    // Fetch messages directly from the specific table
    const query = `
      SELECT id, session_id, message, created_at 
      FROM ${tableName} 
      WHERE session_id = $1 
      ORDER BY created_at ASC
    `
    
    const result = await pool.query(query, [sessionId])
    const dbMessages = result.rows
    
    // Convert database messages to app format (handle both "human"/"ai" and "user"/"ai" types)
    const messages = dbMessages.map(dbMsg => ({
      id: dbMsg.id.toString(),
      uuid: dbMsg.id.toString(),
      created_at: dbMsg.created_at?.toISOString() || new Date().toISOString(),
      role: dbMsg.message.type === 'human' || dbMsg.message.type === 'user' ? 'user' : 'assistant',
      role_type: dbMsg.message.type === 'human' || dbMsg.message.type === 'user' ? 'user' as const : 'assistant' as const,
      content: dbMsg.message.content,
      token_count: 0,
      processed: true
    }))

    return NextResponse.json({
      messages,
      total_count: messages.length,
      row_count: messages.length
    })

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

