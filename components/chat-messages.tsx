"use client"

import { useRef, useEffect } from "react"
import type { Language } from "@/lib/languages"
import { Loader2, Menu, Image as ImageIcon, FileText, File, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useSidebar } from "@/app/contexts/SidebarContext"
import Image from "next/image"

interface AttachedFile {
  file: File
  preview?: string
  type: 'image' | 'document' | 'other'
}

interface ChatMessagesProps {
  messages: Array<{
    id: string
    text: string
    sender: "user" | "assistant"
    timestamp: Date
    files?: AttachedFile[]
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

  const truncateFileName = (fileName: string, maxLength: number = 25) => {
    if (fileName.length <= maxLength) return fileName
    
    // Find the last dot to preserve file extension
    const lastDotIndex = fileName.lastIndexOf('.')
    
    if (lastDotIndex === -1) {
      // No extension, just truncate
      return fileName.substring(0, maxLength - 3) + '...'
    }
    
    const extension = fileName.substring(lastDotIndex)
    const nameWithoutExt = fileName.substring(0, lastDotIndex)
    
    // Calculate available space for name (total - extension - ellipsis)
    const availableSpace = maxLength - extension.length - 3
    
    if (availableSpace <= 0) {
      // Extension is too long, just show part of it
      return fileName.substring(0, maxLength - 3) + '...'
    }
    
    return nameWithoutExt.substring(0, availableSpace) + '...' + extension
  }
  
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
              {/* Files Display */}
              {message.files && message.files.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.files.map((attachedFile, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-white/10 border border-white/20"
                          : "bg-accent-primary/10 border border-accent-primary/20"
                      }`}
                      title={attachedFile.file.name} // Show full name on hover
                    >
                      {attachedFile.preview ? (
                        <Image
                          src={attachedFile.preview}
                          alt={attachedFile.file.name}
                          width={32}
                          height={32}
                          className="rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`h-8 w-8 rounded flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user" ? "bg-white/20" : "bg-accent-primary/20"
                        }`}>
                          {attachedFile.type === 'image' && <ImageIcon className="h-4 w-4" />}
                          {attachedFile.type === 'document' && <FileText className="h-4 w-4" />}
                          {attachedFile.type === 'other' && <File className="h-4 w-4" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className={`text-sm font-medium ${
                          message.sender === "user" ? "text-white" : "text-foreground"
                        }`}>
                          {truncateFileName(attachedFile.file.name, 18)}
                        </p>
                        <p className={`text-xs ${
                          message.sender === "user" ? "text-white/70" : "text-text-secondary"
                        }`}>
                          {(attachedFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-6 w-6 flex-shrink-0 ${
                          message.sender === "user" 
                            ? "hover:bg-white/10 text-white/70 hover:text-white" 
                            : "hover:bg-accent-primary/10 text-text-secondary hover:text-foreground"
                        }`}
                        onClick={() => {
                          const url = URL.createObjectURL(attachedFile.file)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = attachedFile.file.name
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Message Text */}
              {message.text && (
                message.sender === "user" ? message.text : <MarkdownRenderer content={message.text} />
              )}
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