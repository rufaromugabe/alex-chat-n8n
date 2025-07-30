"use client"

import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Domain {
  value: string
  label: string
}

interface DomainPickerProps {
  selectedDomain: Domain
  setSelectedDomain: (domain: Domain) => void
  domains: Domain[]
}

export default function DomainPicker({ selectedDomain, setSelectedDomain, domains }: DomainPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/70 transition-colors border border-slate-700/50 text-white text-xs md:text-sm">
        <span className="truncate max-w-16 md:max-w-20">{selectedDomain.label}</span>
        <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {domains.map((domain) => (
          <DropdownMenuItem
            key={domain.value}
            onClick={() => setSelectedDomain(domain)}
            className="cursor-pointer"
          >
            {domain.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
