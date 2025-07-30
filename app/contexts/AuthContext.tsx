"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

type AuthContextType = {
  isAuthenticated: boolean
  login: (passcode: string) => boolean
  logout: () => void
  isLoading: boolean
  attemptCount: number
  isLockedOut: boolean
  lockoutEndTime: number
  maxAttempts: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// You can change this passcode or move it to environment variables
const VALID_PASSCODE = process.env.NEXT_PUBLIC_ACCESS_PASSCODE 
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutEndTime, setLockoutEndTime] = useState(0)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedAuth = localStorage.getItem('mutumwa_auth')
        const authExpiry = localStorage.getItem('mutumwa_auth_expiry')
        const storedAttempts = localStorage.getItem('mutumwa_attempts')
        const storedLockout = localStorage.getItem('mutumwa_lockout')
        
        // Check lockout status
        if (storedLockout) {
          const lockoutTime = parseInt(storedLockout)
          if (Date.now() < lockoutTime) {
            setIsLockedOut(true)
            setLockoutEndTime(lockoutTime)
          } else {
            localStorage.removeItem('mutumwa_lockout')
            localStorage.removeItem('mutumwa_attempts')
          }
        }

        // Load attempt count
        if (storedAttempts) {
          setAttemptCount(parseInt(storedAttempts))
        }
        
        if (storedAuth && authExpiry) {
          const expiryTime = parseInt(authExpiry)
          const currentTime = Date.now()
          
          // Check if authentication hasn't expired (24 hours)
          if (currentTime < expiryTime && storedAuth === 'authenticated') {
            setIsAuthenticated(true)
          } else {
            // Clear expired authentication
            localStorage.removeItem('mutumwa_auth')
            localStorage.removeItem('mutumwa_auth_expiry')
          }
        }
      } catch (error) {
        console.warn('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (passcode: string): boolean => {
    // Check if locked out
    if (isLockedOut && Date.now() < lockoutEndTime) {
      return false
    }

    if (passcode === VALID_PASSCODE) {
      setIsAuthenticated(true)
      setAttemptCount(0)
      setIsLockedOut(false)
      
      // Clear lockout data
      localStorage.removeItem('mutumwa_attempts')
      localStorage.removeItem('mutumwa_lockout')
      
      // Store authentication with 24-hour expiry
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      localStorage.setItem('mutumwa_auth', 'authenticated')
      localStorage.setItem('mutumwa_auth_expiry', expiryTime.toString())
      
      return true
    } else {
      // Increment attempt count
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)
      localStorage.setItem('mutumwa_attempts', newAttemptCount.toString())
      
      // Check if max attempts reached
      if (newAttemptCount >= MAX_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_TIME
        setIsLockedOut(true)
        setLockoutEndTime(lockoutEnd)
        localStorage.setItem('mutumwa_lockout', lockoutEnd.toString())
      }
      
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('mutumwa_auth')
    localStorage.removeItem('mutumwa_auth_expiry')
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      isLoading,
      attemptCount,
      isLockedOut,
      lockoutEndTime,
      maxAttempts: MAX_ATTEMPTS
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
