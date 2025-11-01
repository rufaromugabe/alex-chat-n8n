"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Send, Paperclip, X, Image, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import VoiceInput from "@/components/voice-input"
import RecordingVisualizer from "@/components/recording-visualizer"

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
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [cancelRecording, setCancelRecording] = useState<(() => void) | null>(null)
  const [confirmRecording, setConfirmRecording] = useState<(() => void) | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'
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
    const maxFiles = 3
    
    // Check if adding these files would exceed the limit
    const currentCount = attachedFiles.length
    const availableSlots = maxFiles - currentCount
    
    if (availableSlots <= 0) {
      alert(`Maximum ${maxFiles} files allowed. Please remove some files first.`)
      return
    }
    
    // Take only the files that fit within the limit
    const filesToAdd = files.slice(0, availableSlots)
    
    // Show warning if some files were not added
    if (files.length > availableSlots) {
      alert(`Only ${availableSlots} file(s) can be added. Maximum ${maxFiles} files allowed.`)
    }
    
    const newAttachedFiles: AttachedFile[] = []
    
    for (const file of filesToAdd) {
      const attachedFile: AttachedFile = {
        file,
        type: getFileType(file),
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        attachedFile.preview = URL.createObjectURL(file)
      }

      newAttachedFiles.push(attachedFile)
    }

    setAttachedFiles(prev => [...prev, ...newAttachedFiles])

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

  const handleVoiceTranscript = (text: string) => {
    // Append the transcribed text to existing input
    setMessage(prev => {
      const separator = prev.trim() ? ' ' : ''
      return prev + separator + text
    })
    
    // Auto-resize textarea for voice input - use longer timeout to ensure DOM update
    setTimeout(() => {
      if (textareaRef.current) {
        // Force recalculation by resetting height first
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = '56px' // Reset to minimum
        
        // Then calculate new height based on content
        const scrollHeight = textareaRef.current.scrollHeight
        const newHeight = Math.min(scrollHeight, 128)
        textareaRef.current.style.height = newHeight + 'px'
        
        // Show scrollbar only when content exceeds max height
        if (scrollHeight > 128) {
          textareaRef.current.style.overflowY = 'auto'
        } else {
          textareaRef.current.style.overflowY = 'hidden'
        }
      }
    }, 10)
  }

  const handleRecordingStateChange = (
    recording: boolean, 
    processing: boolean, 
    stream?: MediaStream | null,
    cancelFn?: () => void,
    confirmFn?: () => void
  ) => {
    setIsRecording(recording)
    setIsProcessing(processing)
    setAudioStream(stream || null)
    setCancelRecording(cancelFn ? () => cancelFn : null)
    setConfirmRecording(confirmFn ? () => confirmFn : null)
  }



  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 md:p-3 lg:p-4 border-t border-border-secondary"
    >
      <div className="max-w-3xl mx-auto">
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((attachedFile, index) => (
              <div
                key={index}
                className="relative bg-bg-elevated border border-border-primary rounded-lg p-2 flex items-center gap-2 w-fit max-w-[200px] md:max-w-[250px]"
                title={attachedFile.file.name} // Show full name on hover
              >
                {attachedFile.preview ? (
                  <img
                    src={attachedFile.preview}
                    alt={attachedFile.file.name}
                    className="h-8 w-8 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 bg-accent-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    {getFileIcon(attachedFile.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-foreground">
                    {truncateFileName(attachedFile.file.name, 20)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(attachedFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full hover:bg-red-500/10 flex-shrink-0"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="relative">
          {!isRecording && !isProcessing && (
            <>
              {/* File Attachment Button - Inside input on the left, settled at bottom */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || attachedFiles.length >= 3}
                className={`absolute left-3 md:left-4 bottom-4 md:bottom-4.5 p-2 transition-all duration-200 z-10 ${
                  isLoading || attachedFiles.length >= 3
                    ? 'cursor-not-allowed text-text-tertiary'
                    : 'cursor-pointer text-text-secondary hover:text-accent-primary'
                }`}
                title={
                  attachedFiles.length >= 3 
                    ? "Maximum 3 files allowed" 
                    : `Attach files (${attachedFiles.length}/3)`
                }
              >
                <Paperclip className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              
              {/* Voice Input Button - Inside input on the right, settled at bottom */}
              <div className="absolute right-14 md:right-16 bottom-4 md:bottom-4.5 z-10">
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  onRecordingStateChange={handleRecordingStateChange}
                  disabled={isLoading}
                />
              </div>
              
              {/* Send Button - Inside input on the far right, settled at bottom */}
              <Button
                type="submit"
                size="icon"
                className={`absolute right-3 md:right-4 bottom-4 md:bottom-4.5 rounded-full bg-accent-primary hover:bg-accent-primary-hover h-9 w-9 md:h-10 md:w-10 
                  shadow-glow-md border border-accent-primary/50
                  transition-all duration-200
                  hover:shadow-glow-lg z-10
                  ${!isLoading && (message.trim() || attachedFiles.length > 0) ? 'animate-pulse-subtle' : ''}`}
                disabled={isLoading || (!message.trim() && attachedFiles.length === 0)}
              >
                <Send className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </>
          )}
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {(isRecording || isProcessing) ? (
            <div className="w-full bg-bg-input text-foreground rounded-2xl border border-border-primary shadow-glow-sm min-h-[56px] px-4 py-4 flex items-center">
              <RecordingVisualizer 
                isRecording={isRecording}
                isProcessing={isProcessing}
                audioStream={audioStream}
                onCancel={cancelRecording || undefined}
                onConfirm={confirmRecording || undefined}
              />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message.."
              className="w-full bg-bg-input text-foreground rounded-2xl pl-14 md:pl-16 pr-24 md:pr-28 py-4 md:py-4.5 focus:outline-none focus:ring-1 focus:ring-border-focus border border-border-primary shadow-glow-sm focus:shadow-glow-md resize-none min-h-[56px] max-h-32 overflow-y-hidden"
              disabled={isLoading}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '56px',
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
          )}
        </div>
      </div>
    </form>
  )
}

