"use client"

import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Language } from "@/lib/languages"

interface LanguagePickerProps {
  selectedLanguage: Language
  setSelectedLanguage: (language: Language) => void
  languages: Language[]
}

export default function LanguagePicker({ selectedLanguage, setSelectedLanguage, languages }: LanguagePickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md bg-bg-secondary/70 backdrop-blur-sm hover:bg-bg-tertiary/70 transition-colors border border-border text-foreground text-xs md:text-sm">
        <span className="truncate max-w-24 md:max-w-32">{selectedLanguage.label}</span>
        <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.value}
            onClick={() => setSelectedLanguage(language)}
            className="cursor-pointer"
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

