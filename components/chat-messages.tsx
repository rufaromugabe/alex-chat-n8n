"use client"

import { useRef, useEffect } from "react"
import type { Language } from "@/lib/languages"
import { Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useSidebar } from "@/app/contexts/SidebarContext"
import Image from "next/image"

interface ChatMessagesProps {
  messages: Array<{
    id: string
    text: string
    sender: "user" | "assistant"
    timestamp: Date
  }>
  isLoading: boolean
  selectedLanguage: Language
  suggestions: string[]
  onSuggestionClick: (text: string) => void
}

export default function ChatMessages({
  messages,
  isLoading,
  selectedLanguage,
  suggestions,
  onSuggestionClick,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  
  // Improved scrolling behavior for mobile
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto overscroll-none p-4 flex flex-col items-center justify-center text-center pt-16 px-2 lg:px-8">
        <div className="relative w-20 h-20 mb-6 shadow-glow-md rounded-full overflow-hidden">
          <Image 
            src="/mut.png"
            alt="Mutumwa AI Logo"
            fill
            sizes="80px"
            className="object-contain"
          />
        </div>
        <p className="text-text-secondary max-w-md lg:max-w-lg">
          Your AI assistant that speaks African languages. Start a conversation and experience the power of multilingual
          communication.
        </p>
        <div className="mt-6 px-4 py-2 bg-bg-elevated rounded-lg text-sm border border-border-primary shadow-sm">
          <span className="text-text-secondary">Selected language: </span>
          <span className="text-foreground font-medium">{selectedLanguage.label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-none h-full pb-4 pt-14 px-2 md:p-4 lg:p-8">
      <div className="max-w-3xl mx-auto w-full relative">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
            <div
              className={`max-w-[85%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                message.sender === "user"
                  ? "bg-accent-primary text-text-inverse border border-accent-primary/50 shadow-glow-sm"
                  : "bg-accent-primary/5 text-foreground border border-accent-primary/20 shadow-sm"
              }`}
            >
              {message.sender === "user" ? message.text : <MarkdownRenderer content={message.text} />}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-3 bg-accent-primary/5 text-foreground border border-accent-primary/20 shadow-sm">
              <div className="flex items-center">
                <span className="text-sm text-text-secondary">Mutumwa is thinking</span>
                <div className="flex ml-2">
                  <span className="h-2 w-2 bg-accent-primary rounded-full mr-1 animate-bounce shadow-glow-sm" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-2 w-2 bg-accent-primary rounded-full mr-1 animate-bounce shadow-glow-sm" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-2 w-2 bg-accent-primary rounded-full animate-bounce shadow-glow-sm" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  )
}