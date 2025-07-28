"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import ChatMessages from "@/components/chat-messages"
import ChatInput from "@/components/chat-input"
import { getLanguageSuggestions } from "@/lib/suggestions"
import { SessionManager } from "@/lib/session-manager"
import { useLanguage } from "../../contexts/LanguageContext"
import { useApp } from "../../contexts/AppContext"

type Message = {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

type Session = {
  session_id: string
  created_at?: string
  updated_at?: string
  metadata?: any
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.sessionId as string
  
  const { 
    messages, 
    setMessages, 
    refreshSessions,
    setCurrentSessionId 
  } = useApp()
  const { selectedLanguage } = useLanguage()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionLoaded, setIsSessionLoaded] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isSessionsLoading, setIsSessionsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch all sessions for history sidebar
  const fetchSessions = useCallback(async () => {
    setIsSessionsLoading(true)
    try {
      const res = await fetch("/api/sessions")
      if (!res.ok) throw new Error("Failed to fetch sessions")
      const data = await res.json()
      setSessions(data.sessions || data || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setSessions([])
    } finally {
      setIsSessionsLoading(false)
    }
  }, [])

  // Load messages for a specific session
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return
    
    setIsSessionLoaded(false)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`)
      if (!res.ok) {
        if (res.status === 404) {
          // New session, no messages yet
          setMessages([])
          setIsSessionLoaded(true)
          setCurrentSessionId(sessionId)
          return
        }
        throw new Error("Failed to fetch session messages")
      }
      
      const data = await res.json()
      
      // Transform Zep messages to our format
      const formattedMessages: Message[] = (data.messages || []).map((msg: any) => ({
        id: msg.uuid || uuidv4(),
        text: msg.content || msg.text,
        sender: msg.role === 'user' ? 'user' : 'assistant',
        timestamp: new Date(msg.created_at || msg.timestamp || Date.now())
      }))
      
      setMessages(formattedMessages)
      setCurrentSessionId(sessionId)
    } catch (err) {
      console.error('Error loading session messages:', err)
      setMessages([])
    } finally {
      setIsSessionLoaded(true)
    }
  }, [setMessages, setCurrentSessionId])

  // Handle URL changes and session loading
  useEffect(() => {
    if (sessionId) {
      loadSessionMessages(sessionId)
    } else {
      // If no sessionId in URL, create a new session
      const newSessionId = uuidv4()
      router.replace(`/chat/${newSessionId}`)
    }
  }, [sessionId, loadSessionMessages, router])

  // Fetch sessions list on component mount
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Handle clicking on a session in the sidebar
  const handleSessionClick = async (clickedSessionId: string) => {
    if (clickedSessionId === sessionId) return // Already on this session
    
    setSidebarOpen(false) // Close sidebar on mobile
    router.push(`/chat/${clickedSessionId}`)
  }

  // Handle creating a new chat
  const handleNewChat = () => {
    const newSessionId = uuidv4()
    setSidebarOpen(false)
    router.push(`/chat/${newSessionId}`)
  }

  // Send message handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return

    // Add user message immediately to UI
    const userMessage: Message = {
      id: uuidv4(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Update session storage and refresh sessions list
    SessionManager.updateSessionWithMessage(sessionId, text, true)
    refreshSessions()

    // Add user message to Zep (async, don't wait for it)
    SessionManager.addMessageToSession(sessionId, text, 'user').catch(error => {
      console.warn('Failed to add user message to Zep:', error)
    })

    setIsLoading(true)

    try {
      // Create form data for the webhook request
      const formData = new FormData()
      formData.append("text", text)
      formData.append("targetLanguage", selectedLanguage.value)
      formData.append("sessionId", sessionId)

      console.log("Sending request to webhook:", process.env.NEXT_PUBLIC_WEBHOOK_URL)
      console.log("Request data:", { text, targetLanguage: selectedLanguage.value, sessionId })

      // Send request to the webhook
      const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL || "", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: uuidv4(),
        text: data.output,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Add assistant message to Zep (async, don't wait for it)
      SessionManager.addMessageToSession(sessionId, data.output, 'assistant').catch(error => {
        console.warn('Failed to add assistant message to Zep:', error)
      })
      
      // Refresh sessions to update the list with new activity
      fetchSessions()
      
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: "Sorry, I couldn't process your message. Please try again.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Format session display name for sidebar
  const getSessionDisplayName = (session: Session) => {
    if (session.metadata?.title) return session.metadata.title
    const date = new Date(session.created_at || session.updated_at || Date.now())
    return `Chat ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  // Loading skeleton component
  const ChatSkeleton = () => (
    <div className="flex-1 overflow-y-auto overscroll-none h-full pb-4 pt-14 px-2 md:p-4 lg:p-8">
      <div className="max-w-3xl mx-auto w-full relative">
        {/* Skeleton messages */}
        {[
          { lines: [{ width: 'w-4/5' }, { width: 'w-3/5' }], size: 'w-[70%] md:w-[60%]' },
          { lines: [{ width: 'w-full' }, { width: 'w-5/6' }, { width: 'w-2/3' }], size: 'w-[90%] md:w-[75%]' },
          { lines: [{ width: 'w-3/4' }], size: 'w-[45%] md:w-[35%]' },
          { lines: [{ width: 'w-full' }, { width: 'w-4/5' }, { width: 'w-3/5' }, { width: 'w-1/2' }], size: 'w-[85%] md:w-[70%]' },
        ].map((message, index) => (
          <div key={index} className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"} mb-4`}>
            <div
              className={`${message.size} lg:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                index % 2 === 0
                  ? "bg-blue-500/20 border border-blue-400/20"
                  : "bg-slate-800/30 border border-slate-700/20"
              }`}
            >
              <div className="animate-pulse">
                {message.lines.map((line, lineIndex) => (
                  <div 
                    key={lineIndex} 
                    className={`h-4 bg-white/10 rounded ${line.width} ${lineIndex < message.lines.length - 1 ? 'mb-2' : ''}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator skeleton */}
        <div className="flex justify-start mb-4">
          <div className="max-w-[85%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-3 bg-slate-800/30 border border-slate-700/20">
            <div className="flex items-center">
              <span className="text-sm text-slate-400/60">Loading conversation...</span>
              <div className="flex ml-2">
                <span className="h-2 w-2 bg-blue-300/40 rounded-full mr-1 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 bg-blue-300/40 rounded-full mr-1 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 bg-blue-300/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

 

  // Show loading state while session is loading
  if (!isSessionLoaded) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto overscroll-none -webkit-overflow-scrolling: touch touch-pan-y scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-gradient-to-b from-slate-900/20 to-transparent h-full max-h-full">
            <ChatSkeleton />
          </div>
          <div className="bg-transparent p-2 px-3 sm:px-4 flex-shrink-0">
            <ChatInput onSendMessage={handleSendMessage} isLoading={true} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      
      <div className="flex-1 flex flex-col">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden flex items-center p-3 bg-slate-900/40 border-b border-slate-800/30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white mr-3"
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto overscroll-none -webkit-overflow-scrolling: touch touch-pan-y scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-gradient-to-b from-slate-900/20 to-transparent h-full max-h-full">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            selectedLanguage={selectedLanguage}
            onSuggestionClick={handleSendMessage}
            suggestions={[]}
          />
        </div>
        
        {/* Suggestion slider - only show when chat hasn't started */}
        {messages.length === 0 && (
          <div className="py-2.5 px-3 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-shrink-0">
            <div className="flex flex-wrap justify-center space-x-3 md:space-x-3 md:flex-row space-y-2 md:space-y-0">
              {getLanguageSuggestions(selectedLanguage.value).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40 hover:text-white text-sm text-white/80 transition-all flex-shrink-0 active:scale-95 touch-manipulation md:mx-1"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat input area */}
        <div className="bg-transparent p-2 px-3 sm:px-4 flex-shrink-0">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}