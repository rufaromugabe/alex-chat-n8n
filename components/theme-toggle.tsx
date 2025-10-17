"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/app/contexts/ThemeContext"
import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className={`border-border bg-bg-secondary/70 hover:bg-bg-tertiary/70 text-foreground p-2 ${className}`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      ) : (
        <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      )}
    </Button>
  )
}
