// Session management utilities for PostgreSQL
import DatabaseManager, { ChatMessage } from './database'

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

// Local storage keys
const SESSIONS_STORAGE_KEY = "mutumwa_chat_sessions"
const CURRENT_SESSION_KEY = "mutumwa_current_session"

export class SessionManager {
  // Get all stored sessions from local storage
  static getAllSessions(): ChatSession[] {
    if (typeof window === "undefined") return []
    
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY)
      if (!stored) return []
      
      const sessions = JSON.parse(stored)
      return sessions.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp)
      }))
    } catch (error) {
      console.error("Error reading sessions from localStorage:", error)
      return []
    }
  }

  // Save sessions to local storage
  static saveSessions(sessions: ChatSession[]): void {
    if (typeof window === "undefined") return
    
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error("Error saving sessions to localStorage:", error)
    }
  }

  // Add or update a session
  static saveSession(session: ChatSession): void {
    console.log("Saving session:", session)
    const sessions = this.getAllSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.unshift(session) // Add to beginning
    }
    
    // Keep only the latest 50 sessions
    const limitedSessions = sessions.slice(0, 50)
    this.saveSessions(limitedSessions)
  }

  // Get current session ID
  static getCurrentSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(CURRENT_SESSION_KEY)
  }

  // Set current session ID
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

  
  // Create a session title from the first message
  static generateSessionTitle(firstMessage: string): string {
    // Take first 50 characters and add ellipsis if longer
    const title = firstMessage.trim().slice(0, 50)
    return title.length < firstMessage.trim().length ? `${title}...` : title
  }
  // Update session with new message info
  static updateSessionWithMessage(sessionId: string, message: string, isUser: boolean): void {
    if (isUser) {
      const sessions = this.getAllSessions()
      const existingIndex = sessions.findIndex(s => s.id === sessionId)
      
      if (existingIndex >= 0) {
        // Update existing session
        sessions[existingIndex].lastMessage = message
        sessions[existingIndex].timestamp = new Date()
        sessions[existingIndex].messageCount += 1
        this.saveSessions(sessions)
      } else {
        // Create new session
        const newSession: ChatSession = {
          id: sessionId,
          title: this.generateSessionTitle(message),
          lastMessage: message,
          timestamp: new Date(),
          messageCount: 1
        }
        this.saveSession(newSession)
      }
    }
  }

  // Delete a session
  static deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions()
    const filteredSessions = sessions.filter(s => s.id !== sessionId)
    this.saveSessions(filteredSessions)
  }

  // Clear all sessions
  static clearAllSessions(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(SESSIONS_STORAGE_KEY)
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }

}