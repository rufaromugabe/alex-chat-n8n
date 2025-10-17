"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { africanLanguages } from "@/lib/languages"

type Language = {
  value: string
  label: string
}

type LanguageContextType = {
  selectedLanguage: Language
  setSelectedLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Set English as default (last item in the array)
  const englishLanguage = africanLanguages.find(lang => lang.value === 'english') || africanLanguages[0]
  const [selectedLanguage, setSelectedLanguage] = useState(englishLanguage)

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
