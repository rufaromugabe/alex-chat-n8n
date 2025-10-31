"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Send, Paperclip, X, Image, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import VoiceInput from "@/components/voice-input"

interface AttachedFile {
  file: File
  preview?: string
  type: 'image' | 'document' | 'other'
}

interface ChatInputProps {
  onSendMessage: (text: string, files?: AttachedFile[]) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'
      textareaRef.current.style.overflowY = 'hidden'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachedFiles.length > 0) && !isLoading) {
      onSendMessage(message, attachedFiles)
      setMessage("")
      setAttachedFiles([])
      resetTextareaHeight()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if ((message.trim() || attachedFiles.length > 0) && !isLoading) {
        onSendMessage(message, attachedFiles)
        setMessage("")
        setAttachedFiles([])
        resetTextareaHeight()
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    for (const file of files) {
      const attachedFile: AttachedFile = {
        file,
        type: getFileType(file),
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        attachedFile.preview = URL.createObjectURL(file)
      }

      setAttachedFiles(prev => [...prev, attachedFile])
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileType = (file: File): 'image' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document'
    return 'other'
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev]
      // Revoke object URL to prevent memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const handleVoiceTranscript = (text: string) => {
    // Set the transcribed text in the input field
    setMessage(text)
    // Auto-resize textarea for voice input
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        const newHeight = Math.min(textareaRef.current.scrollHeight, 128)
        textareaRef.current.style.height = newHeight + 'px'
        
        // Show scrollbar only when content exceeds max height
        if (textareaRef.current.scrollHeight > 128) {
          textareaRef.current.style.overflowY = 'auto'
        } else {
          textareaRef.current.style.overflowY = 'hidden'
        }
      }
    }, 0)
  }



  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 md:p-3 lg:p-4 border-t border-border-secondary"
    >
      <div className="max-w-3xl mx-auto">
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((attachedFile, index) => (
              <div
                key={index}
                className="relative bg-bg-elevated border border-border-primary rounded-lg p-2 flex items-center gap-2 max-w-xs"
              >
                {attachedFile.preview ? (
                  <img
                    src={attachedFile.preview}
                    alt={attachedFile.file.name}
                    className="h-8 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-8 w-8 bg-accent-primary/10 rounded flex items-center justify-center">
                    {getFileIcon(attachedFile.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attachedFile.file.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(attachedFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full hover:bg-red-500/10"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message, attach files, or use voice... (Shift+Enter for new line)"
              className="w-full bg-bg-input text-foreground rounded-2xl px-3 py-2 md:px-4 md:py-2.5 pr-12 focus:outline-none focus:ring-1 focus:ring-border-focus border border-border-primary shadow-glow-sm focus:shadow-glow-md resize-none min-h-[40px] max-h-32 overflow-y-hidden"
              disabled={isLoading}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '40px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                const newHeight = Math.min(target.scrollHeight, 128)
                target.style.height = newHeight + 'px'
                
                // Show scrollbar only when content exceeds max height
                if (target.scrollHeight > 128) {
                  target.style.overflowY = 'auto'
                } else {
                  target.style.overflowY = 'hidden'
                }
              }}
            />
            
            {/* File Attachment Button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-accent-primary/10"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
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
              ${!isLoading && (message.trim() || attachedFiles.length > 0) ? 'animate-pulse-subtle' : ''}`}
            disabled={isLoading || (!message.trim() && attachedFiles.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}

