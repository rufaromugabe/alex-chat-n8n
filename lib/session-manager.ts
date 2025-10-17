// Session management utilities for PostgreSQL

export interface AppMessage {
  id: string
  created_at: string
  updated_at?: string
  role: string
  role_type: "user" | "assistant"
  content: string
  token_count?: number
  processed?: boolean
}

export interface SessionResponse {
  messages: AppMessage[]
  total_count: number
  row_count: number
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

// Local storage keys (only for current session tracking)
const CURRENT_SESSION_KEY = "mutumwa_current_session"

export class SessionManager {
  // Get all threads for a user from database
  static async getAllSessions(userId: string, domain: string = 'general'): Promise<ChatSession[]> {
    try {
      const response = await fetch(`/api/threads?userId=${userId}&domain=${domain}`)

      if (!response.ok) {
        console.warn(`Failed to fetch threads: ${response.statusText}`)
        return []
      }

      const data = await response.json()
      const threads = data.threads || []

      // Convert threads to ChatSession format
      return threads.map((thread: any) => ({
        id: thread.id,
        title: thread.title,
        lastMessage: thread.last_message,
        timestamp: new Date(thread.updated_at),
        messageCount: thread.message_count
      }))
    } catch (error) {
      console.error("Error fetching threads from database:", error)
      return []
    }
  }

  // Get current session ID (still use localStorage for UI state)
  static getCurrentSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(CURRENT_SESSION_KEY)
  }

  // Set current session ID (still use localStorage for UI state)
  static setCurrentSessionId(sessionId: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
  }
  // Fetch messages from PostgreSQL database via our Next.js API route
  static async fetchSessionMessages(sessionId: string, domain: string = 'general'): Promise<AppMessage[]> {
    try {
      console.log(`Fetching messages for session ${sessionId} in domain ${domain}`)
      const response = await fetch(`/api/sessions/${sessionId}/messages?domain=${domain}`)

      if (!response.ok) {
        console.warn(`Failed to fetch messages: ${response.statusText}`)
        return []
      }

      const data: SessionResponse = await response.json()
      console.log("Fetched messages:", data.messages)
      return data.messages || []
    } catch (error) {
      console.error("Error fetching session messages:", error)
      return []
    }
  }


  // Delete a thread from database
  static async deleteSession(sessionId: string, domain: string = 'general'): Promise<boolean> {
    try {
      const response = await fetch(`/api/threads/${sessionId}?domain=${domain}`, {
        method: 'DELETE'
      })

      return response.ok
    } catch (error) {
      console.error("Error deleting thread:", error)
      return false
    }
  }

  // Clear current session from localStorage only
  static clearCurrentSession(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }

}