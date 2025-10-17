"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { SessionManager, ChatSession, AppMessage } from "@/lib/session-manager"

type Message = {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

type AppContextType = {
  showLanding: boolean
  setShowLanding: (show: boolean) => void
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  currentSessionId: string
  setCurrentSessionId: (sessionId: string) => void
  sessions: ChatSession[]
  isLoadingSessions: boolean
  resetApp: () => void
  startNewChat: () => void
  loadSession: (sessionId: string, domain?: string) => Promise<void>
  loadSessionFromUrl: (sessionId: string, domain?: string) => Promise<void>
  deleteSession: (sessionId: string) => void
  refreshSessions: (domain?: string) => void
  updateActiveThreadInSidebar: (sessionId: string, title: string, lastMessage: string) => void
  refreshSessionsForDomain: (domain: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [showLanding, setShowLanding] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentSessionId, setCurrentSessionId] = useState("")
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  // Load sessions from database on mount
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoadingSessions(true)
      try {
        // Get user ID from UserManager
        const { UserManager } = await import("@/lib/user-manager")
        const userId = UserManager.getUserId()
        
        // Fetch sessions from database
        const dbSessions = await SessionManager.getAllSessions(userId, 'general')
        console.log("Loading sessions from database:", dbSessions)
        setSessions(dbSessions)
      } catch (error) {
        console.error("Error loading sessions:", error)
      } finally {
        setIsLoadingSessions(false)
      }
    }
    
    loadSessions()
    
    // Generate initial session ID
    const existingSessionId = SessionManager.getCurrentSessionId()
    if (existingSessionId) {
      setCurrentSessionId(existingSessionId)
      console.log("Using existing session ID:", existingSessionId)
    } else {
      const newSessionId = uuidv4()
      setCurrentSessionId(newSessionId)
      SessionManager.setCurrentSessionId(newSessionId)
      console.log("Created new session ID:", newSessionId)
    }
  }, [])
  const resetApp = useCallback(() => {
    setShowLanding(true)
    setMessages([])
    const newSessionId = uuidv4()
    setCurrentSessionId(newSessionId)
    SessionManager.setCurrentSessionId(newSessionId)
  }, [])

  const startNewChat = useCallback(() => {
    setMessages([])
    const newSessionId = uuidv4()
    setCurrentSessionId(newSessionId)
    SessionManager.setCurrentSessionId(newSessionId)
    // Don't reset showLanding when starting a new chat
  }, [])

  const loadSession = useCallback(async (sessionId: string, domain: string = 'default') => {
    try {
      setCurrentSessionId(sessionId)
      SessionManager.setCurrentSessionId(sessionId)
      setShowLanding(false)
      
      // Fetch messages from PostgreSQL database via our API route
      const appMessages = await SessionManager.fetchSessionMessages(sessionId, domain)
      
      // Convert app messages to local messages format
      const convertedMessages: Message[] = appMessages.map((appMsg) => ({
        id: appMsg.id,
        text: appMsg.content,
        sender: appMsg.role_type,
        timestamp: new Date(appMsg.created_at)
      }))
      
      setMessages(convertedMessages)
    } catch (error) {
      console.error("Error loading session:", error)
      // Don't throw error, just start with empty messages
      setMessages([])
    }
  }, [])

  const loadSessionFromUrl = useCallback(async (sessionId: string, domain: string = 'general') => {
    try {
      console.log(`Loading session from URL: ${sessionId} (domain: ${domain})`)
      setCurrentSessionId(sessionId)
      SessionManager.setCurrentSessionId(sessionId)
      setShowLanding(false)
      
      // Fetch messages from PostgreSQL database via our API route
      const appMessages = await SessionManager.fetchSessionMessages(sessionId, domain)
      
      // Convert app messages to local messages format
      const convertedMessages: Message[] = appMessages.map((appMsg) => ({
        id: appMsg.id,
        text: appMsg.content,
        sender: appMsg.role_type,
        timestamp: new Date(appMsg.created_at)
      }))
      
      if (convertedMessages.length === 0) {
        console.log("No messages found for session, starting fresh")
        setMessages([])
      } else {
        console.log(`Loaded ${convertedMessages.length} messages for session ${sessionId}`)
        setMessages(convertedMessages)
      }
    } catch (error) {
      console.error("Error loading session from URL:", error)
      // Don't throw error, just start with empty messages
      setMessages([])
    }
  }, [])
  const deleteSession = useCallback(async (sessionId: string) => {
    setIsLoadingSessions(true)
    try {
      const { UserManager } = await import("@/lib/user-manager")
      const userId = UserManager.getUserId()
      
      await SessionManager.deleteSession(sessionId, 'general')
      const updatedSessions = await SessionManager.getAllSessions(userId, 'general')
      setSessions(updatedSessions)
      
      // If deleting current session, start a new one
      if (sessionId === currentSessionId) {
        startNewChat()
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [currentSessionId, startNewChat])

  const refreshSessions = useCallback(async (domain: string = 'general') => {
    setIsLoadingSessions(true)
    try {
      const { UserManager } = await import("@/lib/user-manager")
      const userId = UserManager.getUserId()
      
      const dbSessions = await SessionManager.getAllSessions(userId, domain)
      console.log(`Refreshing sessions from database for domain: ${domain}`, dbSessions)
      setSessions(dbSessions)
    } catch (error) {
      console.error("Error refreshing sessions:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  // Refresh sessions for a specific domain (called when domain changes)
  const refreshSessionsForDomain = useCallback(async (domain: string) => {
    console.log(`Domain changed to: ${domain}, refreshing threads...`)
    await refreshSessions(domain)
  }, [refreshSessions])

  // Update active thread in sidebar without fetching from database
  const updateActiveThreadInSidebar = useCallback((sessionId: string, title: string, lastMessage: string) => {
    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionId)
      
      if (existingIndex >= 0) {
        // Update existing session
        const updated = [...prevSessions]
        updated[existingIndex] = {
          ...updated[existingIndex],
          title: title || updated[existingIndex].title, // Keep existing title if not provided
          lastMessage,
          timestamp: new Date(),
          messageCount: updated[existingIndex].messageCount + 1
        }
        return updated
      } else {
        // Add new session at the top
        const newSession: ChatSession = {
          id: sessionId,
          title: title || lastMessage.slice(0, 50) + (lastMessage.length > 50 ? '...' : ''),
          lastMessage,
          timestamp: new Date(),
          messageCount: 1
        }
        return [newSession, ...prevSessions]
      }
    })
  }, [])

  return (
    <AppContext.Provider value={{ 
      showLanding, 
      setShowLanding, 
      messages, 
      setMessages, 
      currentSessionId,
      setCurrentSessionId,
      sessions,
      resetApp, 
      startNewChat,
      loadSession,
      loadSessionFromUrl,
      deleteSession,
      refreshSessions,
      updateActiveThreadInSidebar,
      refreshSessionsForDomain,
      isLoadingSessions
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
