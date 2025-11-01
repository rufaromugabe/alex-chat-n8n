"use client"

import { useEffect, useRef } from "react"
import { X, Check } from "lucide-react"

interface RecordingVisualizerProps {
  isRecording: boolean
  isProcessing?: boolean
  audioStream?: MediaStream | null
  onCancel?: () => void
  onConfirm?: () => void
  className?: string
}

export default function RecordingVisualizer({ 
  isRecording,
  isProcessing = false,
  audioStream, 
  onCancel,
  onConfirm,
  className = "h-14 w-full" 
}: RecordingVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()

  useEffect(() => {
    if (!isRecording || !audioStream) {
      // Stop animation and clear canvas
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
      return
    }

    // Set up audio analysis
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(audioStream)
    const analyzer = audioContext.createAnalyser()
    
    analyzer.fftSize = 256
    analyzer.smoothingTimeConstant = 0.8
    source.connect(analyzer)
    
    analyzerRef.current = analyzer
    const bufferLength = analyzer.frequencyBinCount
    dataArrayRef.current = new Uint8Array(bufferLength)

    const animate = () => {
      if (!isRecording || !canvasRef.current || !analyzerRef.current || !dataArrayRef.current) {
        return
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Get audio data
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
      analyzerRef.current.getByteFrequencyData(dataArray)
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Calculate bar dimensions
      const barCount = 32
      const barWidth = canvas.width / barCount
      const maxBarHeight = canvas.height * 0.8
      
      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Sample frequency data (use every 4th value for better distribution)
        const dataIndex = Math.floor(i * (dataArray.length / barCount))
        const amplitude = dataArray[dataIndex] / 255
        
        // Add some randomness for more dynamic feel when quiet
        const minHeight = 0.1
        const height = Math.max(minHeight, amplitude) * maxBarHeight
        
        const x = i * barWidth + barWidth * 0.1
        const y = (canvas.height - height) / 2
        const width = barWidth * 0.8
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + height)
        gradient.addColorStop(0, '#3b82f6') // Blue
        gradient.addColorStop(0.5, '#06b6d4') // Cyan
        gradient.addColorStop(1, '#10b981') // Green
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, width, height)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContext.state !== 'closed') {
        audioContext.close()
      }
    }
  }, [isRecording, audioStream])

  // Update canvas size when component mounts or resizes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    updateCanvasSize()
    
    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(canvas)
    
    return () => resizeObserver.disconnect()
  }, [])

  if (!isRecording && !isProcessing) {
    return null
  }

  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        className="flex-shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        title="Cancel recording"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Recording Visualization */}
      <div className="flex-1 mx-4 flex items-center justify-center">
        {isProcessing ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm">Processing...</span>
          </div>
        ) : (
          <canvas 
            ref={canvasRef}
            className="w-full h-8"
            style={{ display: 'block' }}
          />
        )}
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isProcessing}
        className="flex-shrink-0 p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Stop and transcribe"
      >
        <Check className="h-5 w-5" />
      </button>
    </div>
  )
}