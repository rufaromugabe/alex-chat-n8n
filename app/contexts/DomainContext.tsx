"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

type Domain = {
  value: string
  label: string
}

type DomainContextType = {
  selectedDomain: Domain
  setSelectedDomain: (domain: Domain) => void
}

const DomainContext = createContext<DomainContextType | undefined>(undefined)

const domains: Domain[] = [
  { value: "zesa", label: "ZESA" },
  { value: "praz", label: "PRAZ" }
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
