"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

type Domain = {
  value: string
  label: string
  webhookUrl: string
}

type DomainContextType = {
  selectedDomain: Domain
  setSelectedDomain: (domain: Domain) => void
}

const DomainContext = createContext<DomainContextType | undefined>(undefined)

const domains: Domain[] = [
  { value: "general", label: "GENERAL", webhookUrl: "https://n8n.afrainity.com/webhook/general" },
  { value: "zesa", label: "ZESA", webhookUrl: "https://n8n.afrainity.com/webhook/zesa" },
  { value: "praz", label: "PRAZ", webhookUrl: "https://n8n.afrainity.com/webhook/praz" }
]

export function DomainProvider({ children }: { children: ReactNode }) {
  const [selectedDomain, setSelectedDomain] = useState(domains[0])

  // Load selected domain from localStorage on mount
  useEffect(() => {
    const storedDomain = localStorage.getItem('selectedDomain')
    if (storedDomain) {
      try {
        const parsedDomain = JSON.parse(storedDomain)
        const foundDomain = domains.find(d => d.value === parsedDomain.value)
        if (foundDomain) {
          setSelectedDomain(foundDomain)
        }
      } catch (error) {
        console.warn('Error parsing stored domain:', error)
      }
    }
  }, [])

  // Save selected domain to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedDomain', JSON.stringify(selectedDomain))
  }, [selectedDomain])

  return (
    <DomainContext.Provider value={{ selectedDomain, setSelectedDomain }}>
      {children}
    </DomainContext.Provider>
  )
}

export function useDomain() {
  const context = useContext(DomainContext)
  if (context === undefined) {
    throw new Error("useDomain must be used within a DomainProvider")
  }
  return context
}

export { domains }
