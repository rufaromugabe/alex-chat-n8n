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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-2xl">
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Protected</h1>
            <p className="text-text-secondary text-sm">Enter your passcode to continue to Mutumwa AI</p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
            <Shield className="h-5 w-5 text-accent-primary" />
            <span className="text-accent-secondary text-sm font-medium">Secure Access Required</span>
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
              <label htmlFor="passcode" className="text-sm font-medium text-text-secondary">
                Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-tertiary" />
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
                  className="w-full pl-10 pr-12 py-3 bg-bg-input/50 border border-border-primary rounded-lg text-foreground placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-secondary transition-colors"
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
              className="w-full bg-accent-primary hover:bg-accent-primary-hover text-text-inverse py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !passcode.trim() || isLockedOut}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-border-primary border-t-foreground rounded-full animate-spin"></div>
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
            <p className="text-text-tertiary text-xs">
              Protected by Mutumwa Security • Contact admin for access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
