"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import ChatMessages from "@/components/chat-messages"
import ChatInput from "@/components/chat-input"
import { getLanguageSuggestions } from "@/lib/suggestions"
import { SessionManager } from "@/lib/session-manager"
import { useLanguage } from "../../contexts/LanguageContext"
import { useDomain } from "../../contexts/DomainContext"
import { useApp } from "../../contexts/AppContext"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
    const { 
    messages, 
    setMessages, 
    loadSessionFromUrl, 
    refreshSessions,
    setCurrentSessionId 
  } = useApp()
  const { selectedLanguage } = useLanguage()
  const { selectedDomain } = useDomain()
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionLoaded, setIsSessionLoaded] = useState(false)
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null)
  // Load session when component mounts or sessionId changes
  useEffect(() => {
    if (sessionId && sessionId !== "new" && sessionId !== loadedSessionId) {
      setLoadedSessionId(sessionId)
      loadSessionFromUrl(sessionId).then(() => {
        setIsSessionLoaded(true)
      })
    } else if (sessionId === "new") {
      // Create new session
      const newSessionId = uuidv4()
      router.replace(`/chat/${newSessionId}`)
    } else if (sessionId === loadedSessionId) {
      // Session already loaded
      setIsSessionLoaded(true)
    } else {
      setIsSessionLoaded(true)
    }
  }, [sessionId, router]) // Removed loadSessionFromUrl from dependencies

  // Set current session ID
  useEffect(() => {
    if (sessionId && sessionId !== "new") {
      setCurrentSessionId(sessionId)
      SessionManager.setCurrentSessionId(sessionId)
    }
  }, [sessionId, setCurrentSessionId])
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionId || sessionId === "new") return

    // Add user message to the chat
    const userMessageId = uuidv4()
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        text,
        sender: "user",
        timestamp: new Date(),
      },
    ])

    // Update session storage with the new message
    SessionManager.updateSessionWithMessage(sessionId, text, true)
    refreshSessions()

    // Add user message to Zep (async, don't wait for it)
    SessionManager.addMessageToSession(sessionId, text, 'user').catch(error => {
      console.warn('Failed to add user message to Zep:', error)
    })

    setIsLoading(true)

    try {
      // Create form data for the request
      const formData = new FormData()
      formData.append("text", text)
      formData.append("targetLanguage", selectedLanguage.value)
      formData.append("sessionId", sessionId)
      formData.append("useCase", selectedDomain.value)

      // Send request to the webhook using environment variable
      const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL || "", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      // Add assistant's response to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: data.output,
          sender: "assistant",
          timestamp: new Date(),
        },
      ])

      // Add assistant message to Zep (async, don't wait for it)
      SessionManager.addMessageToSession(sessionId, data.output, 'assistant').catch(error => {
        console.warn('Failed to add assistant message to Zep:', error)
      })
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message
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
  // Chat skeleton component for loading state
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

  if (!isSessionLoaded) {
    return (
      <>
        {/* Chat skeleton area */}
        <div className="flex-1 overflow-y-auto overscroll-none -webkit-overflow-scrolling: touch touch-pan-y scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-gradient-to-b from-slate-900/20 to-transparent h-full max-h-full">
          <ChatSkeleton />
        </div>
        
       
        
        {/* Chat input area */}
        <div className="bg-transparent p-2 px-3 sm:px-4 flex-shrink-0">
          <ChatInput onSendMessage={handleSendMessage} isLoading={true} />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto overscroll-none -webkit-overflow-scrolling: touch touch-pan-y scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-gradient-to-b from-slate-900/20 to-transparent h-full max-h-full">        <ChatMessages
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
    </>
  )
}
