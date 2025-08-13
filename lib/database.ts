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