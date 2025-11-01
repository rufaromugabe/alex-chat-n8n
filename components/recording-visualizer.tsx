"use client"

import { useEffect, useRef } from "react"
import { X, Check } from "lucide-react"

interface RecordingVisualizerProps {
  isRecording: boolean
  isProcessing?: boolean
  audioStream?: MediaStream | null
  onCancel?: () => void
  onConfirm?: () => void
}

export default function RecordingVisualizer({ 
  isRecording,
  isProcessing = false,
  audioStream, 
  onCancel,
  onConfirm
}: RecordingVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()
  const waveformDataRef = useRef<number[]>([])
  const timeOffsetRef = useRef(0)

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
      // Reset waveform data
      waveformDataRef.current = []
      timeOffsetRef.current = 0
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
      if (!isRecording || !canvasRef.current || !analyzerRef.current) {
        return
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Get audio data
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
      analyzerRef.current.getByteFrequencyData(dataArray)
      
      // Calculate average amplitude for this frame with enhanced sensitivity
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const rawAmplitude = sum / dataArray.length / 255
      
      // Amplify the signal for better visibility (square root for more responsive scaling)
      const amplifiedAmplitude = Math.sqrt(rawAmplitude) * 1.5
      
      // Add current amplitude to waveform data with baseline animation
      const baselineNoise = 0.15 + Math.sin(Date.now() * 0.003) * 0.05 // More prominent baseline
      const finalAmplitude = Math.max(baselineNoise, amplifiedAmplitude)
      waveformDataRef.current.push(finalAmplitude)
      
      // Keep only recent data (sliding window)
      const maxDataPoints = Math.floor(canvas.width / 4) // One data point every 4 pixels
      if (waveformDataRef.current.length > maxDataPoints) {
        waveformDataRef.current.shift()
      }
      
      // Update time offset for smooth scrolling effect
      timeOffsetRef.current += 3 // Slightly faster scrolling
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const waveformData = waveformDataRef.current
      const dataPointSpacing = 4
      const maxBarHeight = canvas.height * 0.85 // Increased from 0.6 to 0.85
      
      // Draw waveform bars from right to left (timeline effect)
      for (let i = 0; i < waveformData.length; i++) {
        const amplitude = waveformData[waveformData.length - 1 - i]
        const height = Math.max(4, amplitude * maxBarHeight) // Minimum height of 4px
        
        // Position from right edge, moving left
        const x = canvas.width - (i * dataPointSpacing) - (timeOffsetRef.current % dataPointSpacing)
        
        if (x < -dataPointSpacing) continue // Don't draw off-screen bars
        
        const y = (canvas.height - height) / 2
        const barWidth = 3 // Increased from 2 to 3
        
        // Create gradient effect based on recency (newer = more opaque)
        const recencyFactor = i / Math.max(1, waveformData.length - 1)
        const baseOpacity = 0.6 + (amplitude * 0.4) // Increased base opacity
        const opacity = baseOpacity * (1 - recencyFactor * 0.5) // Less aggressive fading
        
        // Use dynamic color based on amplitude with more vibrant colors
        const hue = 200 + (amplitude * 60) // Wider blue to purple range
        const saturation = 75 + (amplitude * 20) // Dynamic saturation
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, 65%, ${opacity})`
        
        ctx.fillRect(x, y, barWidth, height)
      }
      
      // Add a subtle current recording indicator line
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(canvas.width - 1, canvas.height * 0.2)
      ctx.lineTo(canvas.width - 1, canvas.height * 0.8)
      ctx.stroke()
      
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