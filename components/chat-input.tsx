"use client"

import type React from "react"
import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import VoiceInput from "@/components/voice-input"

interface ChatInputProps {
  onSendMessage: (text: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleVoiceTranscript = (text: string) => {
    // Set the transcribed text in the input field
    setMessage(text)
  }



  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 md:p-3 lg:p-4 border-t border-border-secondary"
    >
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message or use voice..."
          className="flex-1 bg-bg-input text-foreground rounded-full px-3 py-2 md:px-4 md:py-2.5 focus:outline-none focus:ring-1 focus:ring-border-focus border border-border-primary shadow-glow-sm focus:shadow-glow-md"
          disabled={isLoading}
        />
        <VoiceInput 
          onTranscript={handleVoiceTranscript}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className={`rounded-full bg-accent-primary hover:bg-accent-primary-hover h-9 w-9 md:h-10 md:w-10 
            shadow-glow-md border border-accent-primary/50
            transition-all duration-200
            hover:shadow-glow-lg
            ${!isLoading && message.trim() ? 'animate-pulse-subtle' : ''}`}
          disabled={isLoading || !message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

