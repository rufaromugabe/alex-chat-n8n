"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "mutumwa-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const getInitialTheme = (): Theme => {
      // Try to get from localStorage
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored === "light" || stored === "dark") {
          return stored
        }
      } catch (error) {
        console.warn("Failed to read theme from localStorage:", error)
      }

      // Fall back to system preference
      if (typeof window !== "undefined") {
        try {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          return prefersDark ? "dark" : "light"
        } catch (error) {
          console.warn("Failed to detect system theme preference:", error)
        }
      }

      return defaultTheme
    }

    const initialTheme = getInitialTheme()
    setThemeState(initialTheme)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(initialTheme)
    setMounted(true)
  }, [defaultTheme, storageKey])

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, theme)
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error)
    }
  }, [theme, storageKey, mounted])

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [storageKey])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
