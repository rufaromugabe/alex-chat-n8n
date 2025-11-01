"use client"

import { useState, useRef } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"

interface VoiceInputProps {
    onTranscript: (text: string) => void
    onStreaming?: (partialText: string) => void
    onRecordingStateChange?: (isRecording: boolean, isProcessing: boolean, audioStream?: MediaStream | null, cancelFn?: () => void, confirmFn?: () => void) => void
    disabled?: boolean
}

export default function VoiceInput({ onTranscript, onRecordingStateChange, disabled }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const isCancelledRef = useRef(false)

    const startRecording = async () => {
        try {
            setIsRecording(true)
            chunksRef.current = []
            isCancelledRef.current = false

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                },
            })
            streamRef.current = stream
            
            // Notify parent about recording state change
            onRecordingStateChange?.(true, false, stream, cancelRecording, confirmRecording)

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            })
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                setIsRecording(false)
                
                // If recording was cancelled, don't process
                if (isCancelledRef.current) {
                    isCancelledRef.current = false
                    onRecordingStateChange?.(false, false, null)
                    cleanup()
                    return
                }
                
                setIsProcessing(true)
                
                // Notify parent about processing state
                onRecordingStateChange?.(false, true, null, cancelRecording, undefined)

                try {
                    // Create audio blob
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                    
                    // Send to transcription API
                    const formData = new FormData()
                    formData.append('audio', audioBlob, 'recording.webm')

                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    })

                    if (!response.ok) {
                        throw new Error('Transcription failed')
                    }

                    const { text } = await response.json()
                    if (text.trim()) {
                        onTranscript(text.trim())
                    }
                } catch (error) {
                    console.error('Transcription error:', error)
                    alert('Failed to transcribe audio. Please try again.')
                } finally {
                    setIsProcessing(false)
                    onRecordingStateChange?.(false, false, null)
                    cleanup()
                }
            }

            // Start recording
            mediaRecorder.start()
        } catch (error) {
            console.error('Recording error:', error)
            setIsRecording(false)
            onRecordingStateChange?.(false, false, null)
            alert('Failed to access microphone. Please check permissions.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
    }

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        mediaRecorderRef.current = null
        chunksRef.current = []
        isCancelledRef.current = false
    }

    const cancelRecording = () => {
        isCancelledRef.current = true
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
        } else {
            // If not recording (e.g., during processing), immediately cancel
            setIsRecording(false)
            setIsProcessing(false)
            onRecordingStateChange?.(false, false, null)
            cleanup()
        }
    }

    const confirmRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
    }

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleToggleRecording}
                disabled={disabled || isProcessing}
                className={`p-2 transition-all duration-200 cursor-pointer ${
                    isRecording
                        ? "text-red-500 animate-pulse"
                        : isProcessing
                        ? "text-accent-primary"
                        : "text-text-secondary hover:text-accent-primary"
                }`}
                title={isRecording ? "Stop recording" : "Start voice input"}
            >
                {isProcessing ? (
                    <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : isRecording ? (
                    <MicOff className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                    <Mic className="h-5 w-5 md:h-6 md:w-6" />
                )}
            </button>

            {(isRecording || isProcessing) && (
                <div className="absolute bottom-full mb-2 right-0 bg-bg-elevated border border-border-primary rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                        {isProcessing ? "Processing..." : "Recording..."}
                    </p>
                </div>
            )}
        </div>
    )
}
