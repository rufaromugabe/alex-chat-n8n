import { Pool } from 'pg'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export interface ChatMessage {
  id: number
  session_id: string
  message: {
    type: 'user' | 'ai'
    content: string
    tool_calls?: any[]
    additional_kwargs?: any
    response_metadata?: any
    invalid_tool_calls?: any[]
  }
  created_at?: Date
}

export interface Thread {
  id: string
  user_id: string | null
  title: string
  last_message: string
  timestamp: Date
  message_count: number
  working_memory: any
  created_at: Date
  updated_at: Date
}

export interface UserMemory {
  user_id: string
  working_memory: any
  created_at: Date
  updated_at: Date
}

export class DatabaseManager {
  // Create table for a specific domain
  static async createDomainTable(domain: string): Promise<void> {
    const tableName = `${domain}_chat_histories`

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        message JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_${tableName}_session_id ON ${tableName}(session_id);
    `

    try {
      await pool.query(createTableQuery)
      console.log(`Table ${tableName} created successfully`)
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error)
      throw error
    }
  }

  // Get messages for a session from domain-specific table
  static async getSessionMessages(domain: string, sessionId: string): Promise<ChatMessage[]> {
    const tableName = `${domain}_chat_histories`

    const query = `
      SELECT id, session_id, message, created_at 
      FROM ${tableName} 
      WHERE session_id = $1 
      ORDER BY created_at ASC
    `

    try {
      const result = await pool.query(query, [sessionId])
      return result.rows
    } catch (error) {
      console.error(`Error fetching messages from ${tableName}:`, error)
      return []
    }
  }

  // Add a message to domain-specific table
  static async addMessage(
    domain: string,
    sessionId: string,
    content: string,
    type: 'user' | 'ai'
  ): Promise<boolean> {
    const tableName = `${domain}_chat_histories`

    // Ensure table exists first
    await this.createDomainTable(domain)

    const message = {
      type,
      content,
      tool_calls: [],
      additional_kwargs: {},
      response_metadata: {},
      invalid_tool_calls: []
    }

    const query = `
      INSERT INTO ${tableName} (session_id, message) 
      VALUES ($1, $2) 
      RETURNING id
    `

    try {
      const result = await pool.query(query, [sessionId, JSON.stringify(message)])
      console.log(`Message added to ${tableName} with id: ${result.rows[0].id}`)
      return true
    } catch (error) {
      console.error(`Error adding message to ${tableName}:`, error)
      return false
    }
  }

  // Delete all messages for a session from domain-specific table
  static async deleteSession(domain: string, sessionId: string): Promise<boolean> {
    const tableName = `${domain}_chat_histories`

    const query = `DELETE FROM ${tableName} WHERE session_id = $1`

    try {
      await pool.query(query, [sessionId])
      console.log(`Session ${sessionId} deleted from ${tableName}`)
      return true
    } catch (error) {
      console.error(`Error deleting session from ${tableName}:`, error)
      return false
    }
  }

  // Delete a thread from domain-specific schema
  static async deleteThread(domain: string, threadId: string): Promise<boolean> {
    const query = `DELETE FROM ${domain}.threads WHERE id = $1`

    try {
      await pool.query(query, [threadId])
      console.log(`Thread ${threadId} deleted from ${domain}.threads`)
      return true
    } catch (error) {
      console.error(`Error deleting thread from ${domain}.threads:`, error)
      return false
    }
  }

  // Get messages from domain-specific chats table (e.g., zesa.chats, general.chats)
  static async getChats(domain: string, sessionId: string): Promise<ChatMessage[]> {
    const query = `
      SELECT id, session_id, message 
      FROM ${domain}.chats 
      WHERE session_id = $1 
      ORDER BY id ASC
    `

    try {
      const result = await pool.query(query, [sessionId])
      return result.rows
    } catch (error) {
      console.error(`Error fetching chats from ${domain}.chats:`, error)
      return []
    }
  }

  // Get thread info from domain-specific schema
  static async getThread(domain: string, threadId: string): Promise<Thread | null> {
    const query = `
      SELECT * FROM ${domain}.threads 
      WHERE id = $1
    `

    try {
      const result = await pool.query(query, [threadId])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error fetching thread from ${domain}.threads:`, error)
      return null
    }
  }

  // Get all threads for a user from domain-specific schema
  static async getUserThreads(domain: string, userId: string): Promise<Thread[]> {
    const query = `
      SELECT * FROM ${domain}.threads 
      WHERE user_id = $1 
      ORDER BY updated_at DESC
    `

    try {
      const result = await pool.query(query, [userId])
      return result.rows
    } catch (error) {
      console.error(`Error fetching user threads from ${domain}.threads:`, error)
      return []
    }
  }

  // Create or update thread in domain-specific schema
  static async upsertThread(
    domain: string,
    threadId: string,
    userId: string,
    title: string,
    lastMessage: string,
    messageCount: number,
    workingMemory: any = {}
  ): Promise<boolean> {
    const query = `
      INSERT INTO ${domain}.threads (id, user_id, title, last_message, message_count, working_memory, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        last_message = EXCLUDED.last_message,
        message_count = EXCLUDED.message_count,
        working_memory = EXCLUDED.working_memory,
        updated_at = NOW()
    `

    try {
      await pool.query(query, [threadId, userId, title, lastMessage, messageCount, JSON.stringify(workingMemory)])
      return true
    } catch (error) {
      console.error(`Error upserting thread in ${domain}.threads:`, error)
      return false
    }
  }

  // Get user memory from domain-specific schema
  static async getUserMemory(domain: string, userId: string): Promise<UserMemory | null> {
    const query = `
      SELECT * FROM ${domain}.threads_user_memory 
      WHERE user_id = $1
    `

    try {
      const result = await pool.query(query, [userId])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error fetching user memory from ${domain}.threads_user_memory:`, error)
      return null
    }
  }

  // Update user memory in domain-specific schema
  static async updateUserMemory(domain: string, userId: string, workingMemory: any): Promise<boolean> {
    const query = `
      INSERT INTO ${domain}.threads_user_memory (user_id, working_memory, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        working_memory = EXCLUDED.working_memory,
        updated_at = NOW()
    `

    try {
      await pool.query(query, [userId, JSON.stringify(workingMemory)])
      return true
    } catch (error) {
      console.error(`Error updating user memory in ${domain}.threads_user_memory:`, error)
      return false
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT NOW()')
      console.log('Database connected successfully:', result.rows[0])
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  // Close database connection
  static async close(): Promise<void> {
    await pool.end()
  }
}

export default DatabaseManager