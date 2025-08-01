"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface LoginPageProps {
  onLogin: (passcode: string) => boolean
  attemptCount?: number
  isLockedOut?: boolean
  lockoutEndTime?: number
  maxAttempts?: number
}

export default function LoginPage({ 
  onLogin, 
  attemptCount = 0, 
  isLockedOut = false, 
  lockoutEndTime = 0, 
  maxAttempts = 5 
}: LoginPageProps) {
  const [passcode, setPasscode] = useState("")
  const [showPasscode, setShowPasscode] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Update countdown timer for lockout
  useEffect(() => {
    if (isLockedOut && lockoutEndTime > Date.now()) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, lockoutEndTime - Date.now())
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          clearInterval(timer)
          window.location.reload() // Reload to reset lockout state
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isLockedOut, lockoutEndTime])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLockedOut) {
      setError(`Too many failed attempts. Try again in ${formatTime(timeRemaining)}`)
      return
    }
    
    if (!passcode.trim()) {
      setError("Please enter a passcode")
      return
    }

    setIsLoading(true)
    setError("")

    // Add a small delay to prevent brute force attempts
    await new Promise(resolve => setTimeout(resolve, 500))

    const success = onLogin(passcode)
    
    if (!success) {
      const remaining = maxAttempts - attemptCount - 1
      if (remaining <= 0) {
        setError("Too many failed attempts. Account temporarily locked.")
      } else {
        setError(`Invalid passcode. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`)
      }
      setPasscode("")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-slate-950/95 p-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-800/15 blur-3xl"></div>
        <div className="absolute right-0 top-1/4 h-60 w-60 rounded-full bg-indigo-700/15 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-purple-800/15 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="relative h-16 w-16 mx-auto mb-4">
              <Image 
                src="/logo.png"
                alt="Mutumwa AI Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Protected</h1>
            <p className="text-slate-300 text-sm">Enter your passcode to continue to Mutumwa AI</p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Secure Access Required</span>
          </div>

          {/* Lockout Warning */}
          {isLockedOut && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
              <Clock className="h-5 w-5 text-red-400" />
              <span className="text-red-300 text-sm font-medium">
                Account locked for {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          {/* Attempt Warning */}
          {attemptCount > 0 && !isLockedOut && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
              <span className="text-yellow-300 text-sm font-medium">
                {maxAttempts - attemptCount} attempt{maxAttempts - attemptCount !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-sm font-medium text-slate-300">
                Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="passcode"
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setError("")
                  }}
                  placeholder="Enter your passcode"
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPasscode ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-red-400/20 flex items-center justify-center">!</span>
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !passcode.trim() || isLockedOut}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : isLockedOut ? (
                `Locked for ${formatTime(timeRemaining)}`
              ) : (
                "Access Mutumwa AI"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs">
              Protected by Mutumwa Security • Contact admin for access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
